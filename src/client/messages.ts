import { PhysicBodyState } from './types';
import { ObjectElement, pick } from '../utils';

const joinGame = (gameId: number) => ({
  type: 'joinGame' as 'joinGame',
  gameId,
});

const changes = (body: PhysicBodyState, time: number) => {
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
