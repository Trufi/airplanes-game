import * as ws from 'ws';
import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { AnyClientMsg, msg, ClientMsg } from '../client/messages';
import { AnyServerMsg, ServerMsg } from '../server/messages';
import * as config from '../config';
import { pick } from '../utils';
import { BotBody } from './types';
import { createServerTimeState, updatePingAndServerTime } from '../client/game/serverTime';

export const initBot = (serverUrl: string, name: string, gameId: number) => {
  const serverTimeState = createServerTimeState();

  let connected = false;

  const socket = new ws(`ws://${serverUrl}`);

  const sendMessage = (msg: AnyClientMsg) => {
    socket.send(JSON.stringify(msg));
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

    data.bodies.forEach(({ id, position, velocity, rotation }) => {
      if (id === bodyId) {
        body = {
          position,
          velocity,
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
    let msg: AnyServerMsg;

    try {
      msg = JSON.parse(data);
    } catch (e) {
      console.error(`Bad server message ${data}`);
      return;
    }

    message(msg);
  });

  const time = () => Date.now();

  const changesMsg = (body: BotBody, time: number): ClientMsg['changes'] => {
    const { position, velocity, rotation, velocityDirection, weapon } = body;

    return {
      type: 'changes' as 'changes',
      time,
      body: {
        position,
        velocity,
        rotation,
        velocityDirection,
        weapon: pick(weapon, ['lastShotTime', 'hits']),
      },
    };
  };

  setInterval(() => {
    if (!body || !connected) {
      return;
    }
    sendMessage(changesMsg(body, time() - serverTimeState.diff));
  }, config.clientSendChangesInterval);

  setInterval(() => {
    if (!connected) {
      return;
    }
    sendMessage(msg.ping(time()));
  }, config.clientSendChangesInterval);

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
