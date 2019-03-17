import { AnyClientMsg } from './messages';
import { executeCmd } from './commands/execute';
import { cmd } from './commands';
import { appState } from './appState';
import { message } from './reducers';
import { unpackMessage } from './messages/unpack';

const ws = new WebSocket(`ws://${location.hostname}:3002/`);

ws.binaryType = 'arraybuffer';

export const sendMessage = (msg: AnyClientMsg) => {
  ws.send(JSON.stringify(msg));
};

export const sendPbfMessage = (msg: ArrayBuffer) => {
  ws.send(msg);
};

ws.addEventListener('open', () => {
  console.log('Connected');
});

ws.addEventListener('close', () => {
  console.log('Disconnected');
  appState.connected = false;
  executeCmd(cmd.renderUI());
});

ws.addEventListener('message', (ev) => {
  const msg = unpackMessage(ev.data);
  if (!msg) {
    return;
  }

  const cmd = message(appState, msg);
  executeCmd(cmd);
});
