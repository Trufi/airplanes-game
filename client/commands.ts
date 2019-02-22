import { AnyClientMsg } from './messages';
import { ObjectElement } from '../types/utils';

const sendMsg = (msg: AnyClientMsg) => ({
  type: 'sendMsg' as 'sendMsg',
  msg,
});

const saveNameToLocalStorage = (name: string) => ({
  type: 'saveNameToLocalStorage' as 'saveNameToLocalStorage',
  name,
});

export const cmd = {
  sendMsg,
  saveNameToLocalStorage,
};

export type ExistCmd = ReturnType<ObjectElement<typeof cmd>>;

export type Cmd = ExistCmd | ExistCmd[] | undefined | void;
