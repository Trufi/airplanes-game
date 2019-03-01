import { PhysicBodyState } from './types';
import { ObjectElement } from '../utils';

const login = (name: string) => ({
  type: 'login' as 'login',
  name,
});

const joinGame = (gameId: number) => ({
  type: 'joinGame' as 'joinGame',
  gameId,
});

// добавить передачу хитов на сервер
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
      weapon,
    },
  };
};

const ping = (time: number) => ({
  type: 'ping' as 'ping',
  time,
});

export const msg = {
  login,
  joinGame,
  changes,
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
