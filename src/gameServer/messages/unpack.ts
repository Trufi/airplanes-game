import * as ws from 'ws';
import { AnyClientMsg } from '../../client/messages';

const clientMsgSchema = require('../../protobuf/clientMsg.proto');
const Pbf = require('pbf');

const tagToMsgType: { [key: number]: string } = {};
for (const type in clientMsgSchema.MsgType) {
  tagToMsgType[clientMsgSchema.MsgType[type].value] = type;
}

const unpackPbf = (buffer: ArrayBuffer): AnyClientMsg | undefined => {
  const pbf = new Pbf(buffer);
  const msg = clientMsgSchema.Changes.read(pbf);
  msg.type = tagToMsgType[msg.type];
  return msg;
};

export const unpackMessage = (data: ws.Data): AnyClientMsg | undefined => {
  if (data instanceof Buffer) {
    return unpackPbf(data);
  }

  if (typeof data !== 'string') {
    return;
  }

  let msg: AnyClientMsg;

  try {
    msg = JSON.parse(data);
  } catch (e) {
    console.error(`Bad client message ${data}`);
    return;
  }

  return msg;
};
