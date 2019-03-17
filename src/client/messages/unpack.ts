import { AnyServerMsg } from '../../server/messages';

const serverMsgSchema = require('../../protobuf/serverMsg.proto');
const Pbf = require('pbf');

const tagToMsgType: { [key: number]: string } = {};
for (const type in serverMsgSchema.MsgType) {
  tagToMsgType[serverMsgSchema.MsgType[type].value] = type;
}

const unpackPbf = (buffer: ArrayBuffer): AnyServerMsg | undefined => {
  const pbf = new Pbf(buffer);
  const msg = serverMsgSchema.TickData.read(pbf);
  msg.type = tagToMsgType[msg.type];
  return msg;
};

export const unpackMessage = (data: string | ArrayBuffer): AnyServerMsg | undefined => {
  if (data instanceof ArrayBuffer) {
    return unpackPbf(data);
  }

  if (typeof data !== 'string') {
    return;
  }

  let msg: AnyServerMsg;

  try {
    msg = JSON.parse(data);
  } catch (e) {
    console.error(`Bad server message ${data}`);
    return;
  }

  return msg;
};
