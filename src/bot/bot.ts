import * as ws from 'ws';
import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { AnyClientMsg, msg } from '../client/messages';
import { AnyServerMsg, ServerMsg } from '../server/messages';
import * as config from '../config';
import { BotBody } from './types';
import { createServerTimeState, updatePingAndServerTime } from '../client/common/serverTime';
import { time } from '../client/utils';

const clientMsgSchema = require('../protobuf/clientMsg.proto');
const Pbf = require('pbf');

export const initBot = (serverUrl: string, name: string, gameId: number) => {
  const serverTimeState = createServerTimeState();

  let connected = false;

  const socket = new ws(`ws://${serverUrl}`);

  const sendMessage = (msg: AnyClientMsg) => {
    socket.send(JSON.stringify(msg));
  };

  const sendPbfMessage = (msg: ArrayBuffer) => {
    socket.send(msg);
  };

  socket.on('open', () => {
    console.log(`Bot ${name} connected to server`);
    connected = true;
    sendMessage(msg.botAuth(name));
    sendMessage(msg.joinGame(gameId));
  });

  let body: BotBody | undefined;

  const startDataMessage = (data: ServerMsg['startData']) => {
    console.log(`Bot ${name} join game ${gameId}`);

    let bodyId = -1;

    data.players.forEach((playerData) => {
      if (data.playerId === playerData.id) {
        bodyId = playerData.bodyId;
      }
    });

    data.bodies.forEach(({ id, position, rotation }) => {
      if (id === bodyId) {
        body = {
          position,
          velocity: config.airplane.velocity,
          rotation,
          velocityDirection: [0, 0, 0.0007],
          weapon: {
            hits: [],
            lastShotTime: 0,
          },
        };
      }
    });
  };

  const message = (msg: AnyServerMsg) => {
    switch (msg.type) {
      case 'startData':
        return startDataMessage(msg);
      case 'pong':
        return updatePingAndServerTime(serverTimeState, msg);
    }
  };

  socket.on('message', (data: string) => {
    if (typeof data !== 'string') {
      return;
    }

    let msg: AnyServerMsg;

    try {
      msg = JSON.parse(data);
    } catch (e) {
      console.error(`Bad server message ${data}`);
      return;
    }

    message(msg);
  });

  const changes = (body: BotBody, time: number, diffTime: number) => {
    const {
      position,
      weapon: { lastShotTime, hits },
    } = body;

    // На сервер передаем вращение с учетом угловой скорости
    const rotation = [0, 0, 0, 1];
    quat.rotateY(
      rotation,
      body.rotation,
      -body.velocityDirection[2] * config.airplane.yRotationFactor,
    );

    return {
      type: 'changes' as 'changes',
      time: (time - diffTime) | 0,
      position: {
        x: position[0] | 0,
        y: position[1] | 0,
        z: position[2] | 0,
      },
      rotation: {
        x: rotation[0],
        y: rotation[1],
        z: rotation[2],
        w: rotation[3],
      },
      lastShotTime: (lastShotTime - diffTime) | 0,
      hitBodyIds: hits.map(({ bodyId }) => bodyId),
    };
  };

  const pbfChanges = (body: BotBody, time: number, diffTime: number) => {
    const pbf = new Pbf();
    clientMsgSchema.Changes.write(changes(body, time, diffTime), pbf);
    const u8 = pbf.finish() as Uint8Array;
    return u8.buffer.slice(0, u8.byteLength);
  };

  setInterval(() => {
    if (!body || !connected) {
      return;
    }
    sendPbfMessage(pbfChanges(body, time(), serverTimeState.diff));
  }, config.clientSendChangesInterval);

  setInterval(() => {
    if (!connected) {
      return;
    }
    sendMessage(msg.ping(time()));
  }, config.clientPingInterval);

  const velocityVector = [0, 0, 0];
  const rotation = [0, 0, 0, 1];
  const updatePhysicBody = (body: BotBody, dt: number) => {
    quat.identity(rotation);
    quat.rotateX(rotation, rotation, body.velocityDirection[0] * dt);
    quat.rotateY(rotation, rotation, body.velocityDirection[1] * dt);
    quat.rotateZ(rotation, rotation, body.velocityDirection[2] * dt);

    quat.mul(body.rotation, body.rotation, rotation);

    vec3.set(velocityVector, 0, body.velocity, 0);
    vec3.transformQuat(velocityVector, velocityVector, body.rotation);

    body.position[0] += velocityVector[0] * dt;
    body.position[1] += velocityVector[1] * dt;
    body.position[2] = Math.max(body.position[2] + velocityVector[2] * dt, config.minimalHeight);
  };

  let prevTime = time();
  setInterval(() => {
    const now = time();

    if (body) {
      updatePhysicBody(body, now - prevTime);
    }

    prevTime = now;
  }, 30);
};
