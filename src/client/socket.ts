import { AnyServerMsg } from '../server/messages';
import { AnyClientMsg, msg } from './messages';
import { executeCmd } from './commands/execute';
import { cmd } from './commands';
import { appState } from './appState';
import { message } from './reducers';

const ws = new WebSocket(`ws://${location.hostname}:3002/`);

export const sendMessage = (msg: AnyClientMsg) => {
  ws.send(JSON.stringify(msg));
};

ws.addEventListener('open', () => {
  const name = localStorage.getItem('name');
  if (name) {
    sendMessage(msg.login(name));
  }
  console.log('Connected');
});

ws.addEventListener('close', () => {
  console.log('Disconnected');
  appState.connected = false;
  executeCmd(cmd.renderUI());
});

ws.addEventListener('message', (ev) => {
  let msg: AnyServerMsg;

  try {
    msg = JSON.parse(ev.data);
  } catch (e) {
    console.error(`Bad server message ${ev.data}`);
    return;
  }

  const cmd = message(appState, msg);
  executeCmd(cmd);
});
