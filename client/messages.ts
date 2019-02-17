import { SessionState } from './types';
import { ObjectElement } from '../types/utils';

const start = (name: string) => ({
  type: 'start' as 'start',
  name,
});

// добавить передачу хитов на сервер
const changes = (session: SessionState) => {
  const {
    body: { position, velocity, rotation, velocityDirection, weapon },
  } = session;

  return {
    type: 'changes' as 'changes',
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
  start,
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
