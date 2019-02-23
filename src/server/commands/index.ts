import { AnyServerMsg } from '../messages';
import { ObjectElement } from '../../utils';

const sendMsg = (connectionId: number, msg: AnyServerMsg) => ({
  type: 'sendMsg' as 'sendMsg',
  connectionId,
  msg,
});

const sendMsgTo = (connectionIds: number[], msg: AnyServerMsg) => ({
  type: 'sendMsgTo' as 'sendMsgTo',
  connectionIds,
  msg,
});

export const cmd = {
  sendMsg,
  sendMsgTo,
};

export const union = (cmds: Cmd[]): Cmd => {
  let res: Cmd = [];

  for (const c of cmds) {
    if (c) {
      res = res.concat(c);
    }
  }

  return res;
};

export type ExistCmd = ReturnType<ObjectElement<typeof cmd>>;

export type Cmd = ExistCmd | ExistCmd[] | undefined | void;
