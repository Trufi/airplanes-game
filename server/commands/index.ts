import { ObjectElement } from '../../types/utils';
import { AnyServerMsg } from '../messages';

const sendMsg = (msg: AnyServerMsg, connectionId: number) => ({
  type: 'sendMsg' as 'sendMsg',
  connectionId,
  msg,
});

const sendMsgToAll = (msg: AnyServerMsg) => ({
  type: 'sendMsgToAll' as 'sendMsgToAll',
  msg,
});

export const cmd = {
  sendMsg,
  sendMsgToAll,
};

export type ExistCmd = ReturnType<ObjectElement<typeof cmd>>;

export type Cmd = ExistCmd | ExistCmd[] | undefined | void;
