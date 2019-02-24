import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Root } from './components/root';
import { createState } from './state';
import { AnyClientMsg, msg } from './messages';
import { AnyServerMsg } from '../server/messages';
import { message } from './reducers';
import { processPressedkeys } from './reducers/actions';
import { tick } from './reducers/tick';
import { State } from './types';
import { time } from './utils';
import { Cmd, ExistCmd } from './commands';

const renderUI = (state: State, executeCmd: ExecuteCmd) => {
  ReactDOM.render(<Root state={state} executeCmd={executeCmd} />, document.getElementById('root'));
};

const state = createState(Date.now());

const ws = new WebSocket(`ws://${location.hostname}:3002/`);

export type ExecuteCmd = typeof executeCmd;

const executeCmd = (cmd: Cmd) => {
  if (cmd) {
    if (Array.isArray(cmd)) {
      cmd.forEach(executeOneCmd);
    } else {
      executeOneCmd(cmd);
    }
  }
};

renderUI(state, executeCmd);

const sendMessage = (msg: AnyClientMsg) => {
  ws.send(JSON.stringify(msg));
};

const executeOneCmd = (cmd: ExistCmd) => {
  switch (cmd.type) {
    case 'sendMsg':
      sendMessage(cmd.msg);
      break;
    case 'saveNameToLocalStorage':
      localStorage.setItem('name', cmd.name);
      break;
    case 'renderUI':
      renderUI(state, executeCmd);
      break;
  }
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
});

ws.addEventListener('message', (ev) => {
  let msg: AnyServerMsg;

  try {
    msg = JSON.parse(ev.data);
  } catch (e) {
    console.error(`Bad server message ${ev.data}`);
    return;
  }

  const cmd = message(state, msg);
  executeCmd(cmd);
});

window.addEventListener('keydown', (ev) => {
  state.pressedKeys[ev.code] = true;
});

window.addEventListener('keyup', (ev) => {
  state.pressedKeys[ev.code] = false;
});

const fullscreenButton = document.getElementById('fullscreen') as HTMLElement;
fullscreenButton.addEventListener('click', () => {
  document.body.requestFullscreen();
});

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('overlay') as HTMLCanvasElement,
  alpha: true,
  antialias: true,
});

const onResize = () => {
  state.map.invalidateSize();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  state.camera.aspect = window.innerWidth / window.innerHeight;
  state.camera.updateProjectionMatrix();
};

window.addEventListener('resize', onResize);
onResize();

function loop() {
  requestAnimationFrame(loop);
  if (!state.game) {
    return;
  }

  const now = time();

  processPressedkeys(now - state.time, state);

  tick(state, now);

  renderer.render(state.scene, state.camera);
  renderUI(state, executeCmd);
}
requestAnimationFrame(loop);

setInterval(() => {
  if (state.game) {
    sendMessage(msg.changes(state.game, time() - state.serverTime.diff));

    // Сбрасываем попадания после отправки на сервер
    state.game.body.weapon.hits = [];
  }
}, 50);

setInterval(() => {
  sendMessage(msg.ping(time()));
}, 500);
