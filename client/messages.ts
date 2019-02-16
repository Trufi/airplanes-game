import { WeaponState, SessionState } from './types';
import { ObjectElement } from '../types/utils';

const start = (name: string) => ({
  type: 'start' as 'start',
  name,
});

// добавить передачу хитов на сервер
const changes = (session: SessionState, weapon: WeaponState) => {
  const {
    body: { position, velocity, rotation },
  } = session;

  const { hits } = weapon;

  return {
    type: 'changes' as 'changes',
    body: {
      position,
      velocity,
      rotation,
    },
    hits,
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
