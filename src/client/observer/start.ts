import { ObserverState } from './types';
import { ServerMsg } from '../../gameServer/messages';
import { addBody, createPlayer, createNonPhysicBody } from '../game/common';
import * as config from '../../config';
import * as view from '../game/view';
import * as control from './control';
import { keyboard } from '../common/keyboard';
import { createServerTimeState } from '../common/serverTime';
import { createNotesState } from '../common/notes';
import { AppState } from '../types';
import { time } from '../utils';
import { renderUI } from '../ui';
import { executeCmd } from '../commands/execute';
import { sendMessage } from '../socket';
import { msg } from '../messages/index';
import { tick } from './tick';
import { createHealPointsState, setHealPointState } from '../game/actions/healPoints';
import { originByCity } from '../../cities';

export const start = (appState: AppState, data: ServerMsg['startObserverData']) => {
  const players: ObserverState['players'] = new Map();

  data.players.forEach((playerData) => {
    const player = createPlayer(playerData);
    players.set(player.id, player);
  });

  const bodies: ObserverState['bodies'] = new Map();
  data.bodies.forEach((bodyData) => {
    const body = createNonPhysicBody(bodyData);
    bodies.set(body.id, body);
  });

  const now = time();

  const overlay = document.getElementById('root') as HTMLElement;

  const origin = originByCity[data.city];

  const state: ObserverState = {
    type: 'observer',
    time: now,
    prevTime: now,
    restartTime: 0,
    serverEndTime: data.endTime,
    origin: [origin[0], origin[1], 0],
    players,
    bodies,
    healPoints: createHealPointsState(),
    renderer: view.createRenderer(),
    scene: view.createScene(),
    camera: view.createCamera(),
    serverTime: createServerTimeState(now),
    keyboard: keyboard.enable(),
    notes: createNotesState(),
    control: control.enable(overlay),
    callbacks: {
      loopId: 0,
      loop: () => {},
      pingId: 0,
      ping: () => {},
      resize: () => {},
    },
  };

  view.createMap();

  appState.observer = state;

  bodies.forEach((body) => addBody(state, body));
  setHealPointState(state, data.healPoints);

  state.callbacks.resize = () => {
    view.resize(state.camera.object, state.renderer);
  };
  window.addEventListener('resize', state.callbacks.resize);
  state.callbacks.resize();

  const loopCallback = () => {
    state.callbacks.loopId = requestAnimationFrame(loopCallback);

    const now = time();
    tick(state, now);

    state.renderer.render(state.scene, state.camera.object);
    renderUI(appState, executeCmd);
  };
  state.callbacks.loop = loopCallback;
  loopCallback();

  state.callbacks.ping = () => sendMessage(msg.ping(time()));
  state.callbacks.pingId = window.setInterval(state.callbacks.ping, config.clientPingInterval);
};
