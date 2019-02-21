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

const renderUI = (state: State) => {
  ReactDOM.render(<Root state={state} />, document.getElementById('root'));
};

const state = createState(Date.now());

renderUI(state);

const ws = new WebSocket(`ws://localhost:3002/`);

function sendMessage(msg: AnyClientMsg) {
  ws.send(JSON.stringify(msg));
}

ws.addEventListener('open', () => {
  console.log('Connected');

  sendMessage(msg.start(`Random-${Math.round(Math.random() * 100)}`));
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

  message(state, msg);
});

window.addEventListener('keydown', (ev) => {
  state.pressedKeys[ev.code] = true;
});

window.addEventListener('keyup', (ev) => {
  state.pressedKeys[ev.code] = false;
});

const leftButton = document.getElementById('left') as HTMLElement;
leftButton.addEventListener('touchstart', (ev) => {
  ev.preventDefault();
  state.pressedKeys['KeyA'] = true;
});
leftButton.addEventListener('touchend', (ev) => {
  ev.preventDefault();
  state.pressedKeys['KeyA'] = false;
});

const rightButton = document.getElementById('right') as HTMLElement;
rightButton.addEventListener('touchstart', (ev) => {
  ev.preventDefault();
  state.pressedKeys['KeyD'] = true;
});
rightButton.addEventListener('touchend', (ev) => {
  ev.preventDefault();
  state.pressedKeys['KeyD'] = false;
});

const upButton = document.getElementById('up') as HTMLElement;
upButton.addEventListener('touchstart', (ev) => {
  ev.preventDefault();
  state.pressedKeys['KeyS'] = true;
});
upButton.addEventListener('touchend', (ev) => {
  ev.preventDefault();
  state.pressedKeys['KeyS'] = false;
});

const downButton = document.getElementById('down') as HTMLElement;
downButton.addEventListener('touchstart', (ev) => {
  ev.preventDefault();
  state.pressedKeys['KeyW'] = true;
});
downButton.addEventListener('touchend', (ev) => {
  ev.preventDefault();
  state.pressedKeys['KeyW'] = false;
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
  if (!state.session) {
    return;
  }

  const now = time();

  processPressedkeys(now - state.time, state);

  tick(state, now);

  renderer.render(state.scene, state.camera);
  renderUI(state);
}
requestAnimationFrame(loop);

setInterval(() => {
  if (state.session) {
    sendMessage(msg.changes(state.session, time() - state.serverTime.diff));

    // Сбрасываем попадания после отправки на сервер
    state.session.body.weapon.hits = [];
  }
}, 50);

setInterval(() => {
  sendMessage(msg.ping(time()));
}, 500);
