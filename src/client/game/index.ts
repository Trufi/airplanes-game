import * as THREE from 'three';
import { msg } from '../messages';
import { processPressedkeys } from './actions/keys';
import { tick } from './actions/tick';
import { time } from '../utils';
import { renderUI } from '../ui';
import { executeCmd } from '../commands/execute';
import { sendMessage } from '../socket';
import { ServerMsg } from '../../server/messages';
import { start as startAction } from './actions/start';
import { appState } from '../appState';

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('overlay') as HTMLCanvasElement,
  alpha: true,
  antialias: window.devicePixelRatio < 2,
});

const onResize = () => {
  document.body.style.width = `${window.innerWidth}px`;
  document.body.style.height = `${window.innerHeight}px`;

  const { game } = appState;

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  if (game) {
    game.map.invalidateSize();
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
  }
};
window.addEventListener('resize', onResize);

export const start = (startMsg: ServerMsg['startData']) => {
  if (!appState.name || !appState.id) {
    return;
  }

  const state = (appState.game = startAction(time(), startMsg));

  window.addEventListener('keydown', (ev) => {
    state.pressedKeys[ev.code] = true;
  });

  window.addEventListener('keyup', (ev) => {
    state.pressedKeys[ev.code] = false;
  });

  onResize();

  function loop() {
    requestAnimationFrame(loop);

    const now = time();

    processPressedkeys(now - state.time, state);

    tick(state, now);

    renderer.render(state.scene, state.camera);
    renderUI(appState, executeCmd);
  }
  requestAnimationFrame(loop);

  setInterval(() => {
    if (!state.body) {
      return;
    }

    sendMessage(msg.changes(state.body, time() - state.serverTime.diff));

    // Сбрасываем попадания после отправки на сервер
    state.body.weapon.hits = [];
  }, 50);

  setInterval(() => {
    sendMessage(msg.ping(time()));
  }, 500);
};
