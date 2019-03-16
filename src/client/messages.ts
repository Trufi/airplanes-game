import { PhysicBodyState } from './types';
import { ObjectElement } from '../utils';

const joinGame = (gameId: number) => ({
  type: 'joinGame' as 'joinGame',
  gameId,
});

const joinGameAsObserver = (gameId: number) => ({
  type: 'joinGameAsObserver' as 'joinGameAsObserver',
  gameId,
});

const changes = (body: PhysicBodyState, time: number, diffTime: number) => {
  const { position, velocity, rotation, velocityDirection, weapon } = body;
  const msgWeapon = {
    lastShotTime: weapon.lastShotTime - diffTime,
    hits: weapon.hits,
  };

  return {
    type: 'changes' as 'changes',
    time: time - diffTime,
    body: {
      position,
      velocity,
      rotation,
      velocityDirection,
      weapon: msgWeapon,
    },
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
