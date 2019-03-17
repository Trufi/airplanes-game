import * as quat from '@2gis/gl-matrix/quat';
import { PhysicBodyState } from '../types';
import { ObjectElement } from '../../utils';
import * as config from '../../config';

const clientMsgSchema = require('../../protobuf/clientMsg.proto');
const Pbf = require('pbf');

const joinGame = (gameId: number) => ({
  type: 'joinGame' as 'joinGame',
  gameId,
});

const joinGameAsObserver = (gameId: number) => ({
  type: 'joinGameAsObserver' as 'joinGameAsObserver',
  gameId,
});

const changes = (body: PhysicBodyState, time: number, diffTime: number) => {
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

const restart = () => ({
  type: 'restart' as 'restart',
});

const ping = (time: number) => ({
  type: 'ping' as 'ping',
  time,
});

const auth = (token: string) => ({
  type: 'auth' as 'auth',
  token,
});

const botAuth = (name: string) => ({
  type: 'botAuth' as 'botAuth',
  name,
});

export const msg = {
  joinGame,
  joinGameAsObserver,
  changes,
  restart,
  auth,
  botAuth,
  ping,
};

export const pbfMsg = {
  changes: (body: PhysicBodyState, time: number, diffTime: number) => {
    const pbf = new Pbf();
    clientMsgSchema.Changes.write(changes(body, time, diffTime), pbf);
    const u8 = pbf.finish() as Uint8Array;
    return u8.buffer.slice(0, u8.byteLength);
  },
};

/**
 * Union тип всех сообщений клиента
 */
export type AnyClientMsg = ReturnType<ObjectElement<typeof msg>>;

type MsgMap = typeof msg;
/**
 * Мапа всех сообщений клиента, с помощью которой можно получить конкретное:
 * type BodyStateMsg = ClientMsg['bodyState'];
 */
export type ClientMsg = { [K in keyof MsgMap]: ReturnType<MsgMap[K]> };
