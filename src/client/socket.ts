import { AnyClientMsg } from './messages';
import { executeCmd } from './commands/execute';
import { cmd } from './commands';
import { appState } from './appState';
import { message } from './reducers';
import { unpackMessage } from './messages/unpack';

let url = `ws://${location.host}`;

// Если дев сборка, то порт будет 3000, а сервак смотрит на 3002
if (location.port === '3000') {
  url = url.replace('3000', '3002');
}

const ws = new WebSocket(url);

ws.binaryType = 'arraybuffer';

export const sendMessage = (msg: AnyClientMsg) => {
  ws.send(JSON.stringify(msg));
};

export const sendPbfMessage = (msg: ArrayBuffer) => {
  ws.send(msg);
};

ws.addEventListener('open', () => {
  console.log('Connecte3d');
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
