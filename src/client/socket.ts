import { AnyClientMsg } from './messages';
import { executeCmd } from './commands/execute';
import { cmd } from './commands';
import { appState } from './appState';
import { message, connected } from './reducers';
import { unpackMessage } from './messages/unpack';

let ws: WebSocket | undefined;

export const connect = (url: string) => {
  if (ws) {
    ws.close();
  }

  // Если дев сборка, то выключаем ssl
  if (location.port === '3000' && url.indexOf('2gis') === -1) {
    url = `ws://${url}`;
  } else {
    url = `wss://${url}`;
  }

  ws = new WebSocket(url);
  ws.binaryType = 'arraybuffer';

  ws.addEventListener('open', () => {
    console.log('Connected');
    appState.connected = true;
    const cmd = connected(appState);
    executeCmd(cmd);
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
};

export const sendMessage = (msg: AnyClientMsg) => {
  if (ws) {
    ws.send(JSON.stringify(msg));
  }
};

export const sendPbfMessage = (msg: ArrayBuffer) => {
  if (ws) {
    ws.send(msg);
  }
};
