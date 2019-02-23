import { AnyClientMsg } from './messages';
import { ObjectElement } from '../utils';

const sendMsg = (msg: AnyClientMsg) => ({
  type: 'sendMsg' as 'sendMsg',
  msg,
});

const saveNameToLocalStorage = (name: string) => ({
  type: 'saveNameToLocalStorage' as 'saveNameToLocalStorage',
  name,
});

const renderUI = () => ({
  type: 'renderUI' as 'renderUI',
});

export const cmd = {
  sendMsg,
  saveNameToLocalStorage,
  renderUI,
};

export type ExistCmd = ReturnType<ObjectElement<typeof cmd>>;

export type Cmd = ExistCmd | ExistCmd[] | undefined | void;
