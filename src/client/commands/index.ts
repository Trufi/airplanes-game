import { AnyClientMsg } from '../messages';
import { ObjectElement } from '../../utils';

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

export const union = (cmds: Cmd[]): Cmd => {
  let res: Cmd = [];

  for (const c of cmds) {
    if (c) {
      res = res.concat(c);
    }
  }

  return res;
};