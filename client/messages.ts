import { PhysicBodyState } from './types';
import { ObjectElement } from '../types/utils';

const start = (name: string) => ({
  type: 'start' as 'start',
  name,
});

const bodyState = (body: PhysicBodyState) => ({
  type: 'bodyState' as 'bodyState',
  position: body.position,
  velocity: body.velocity,
  rotation: body.rotation,
});

const ping = (time: number) => ({
  type: 'ping' as 'ping',
  time,
});

export const msg = {
  start,
  bodyState,
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
