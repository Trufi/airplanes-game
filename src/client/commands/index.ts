import { AnyClientMsg } from '../messages/index';
import { ObjectElement } from '../../utils';

const connectToGameServer = (url: string) => ({
  type: 'connectToGameServer' as 'connectToGameServer',
  url,
});

const sendMsg = (msg: AnyClientMsg) => ({
  type: 'sendMsg' as 'sendMsg',
  msg,
});

const sendPbfMsg = (msg: ArrayBuffer) => ({
  type: 'sendPbfMsg' as 'sendPbfMsg',
  msg,
});

const renderUI = () => ({
  type: 'renderUI' as 'renderUI',
});

export const cmd = {
  connectToGameServer,
  sendMsg,
  sendPbfMsg,
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
