import * as ws from 'ws';
import { AnyClientMsg } from '../../client/messages';
import { check } from './validation';

const clientMsgSchema = require('../../protobuf/clientMsg.proto');
const Pbf = require('pbf');

const tagToMsgType: { [key: number]: string } = {};
for (const type in clientMsgSchema.MsgType) {
  tagToMsgType[clientMsgSchema.MsgType[type].value] = type;
}

const unpackPbf = (buffer: ArrayBuffer, id: number): AnyClientMsg | undefined => {
  let msg: AnyClientMsg | undefined;

  try {
    const pbf = new Pbf(buffer);
    const pbfMsg = clientMsgSchema.Changes.read(pbf);
    pbfMsg.type = tagToMsgType[pbfMsg.type];

    msg = pbfMsg;
  } catch (err) {
    console.log(`Client (id: ${id} pbf msg parse error`);
    return;
  }

  if (msg && check(msg, id)) {
    return msg;
  }
};

export const unpackMessage = (data: ws.Data, id: number): AnyClientMsg | undefined => {
  if (data instanceof Buffer) {
    return unpackPbf(data, id);
  }

  if (typeof data !== 'string') {
    return;
  }

  let msg: AnyClientMsg;

  try {
    msg = JSON.parse(data);
  } catch (err) {
    console.error(`Client msg parse error`);
    return;
  }

  if (check(msg, id)) {
    return msg;
  }
};
