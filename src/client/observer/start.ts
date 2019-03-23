import { projectGeoToMap } from '@2gis/jakarta/dist/es6/utils/geo';
import { ObserverState } from './types';
import { ServerMsg } from '../../gameServer/messages';
import { addBody, createPlayer, createNonPhysicBody } from '../game/common';
import * as config from '../../config';
import * as view from '../game/view';
import * as control from './control';
import { keyboard } from './keyboard';
import { createServerTimeState } from '../common/serverTime';
import { createNotesState } from '../common/notes';
import { AppState } from '../types';
import { time } from '../utils';
import { renderUI } from '../ui';
import { executeCmd } from '../commands/execute';
import { sendMessage } from '../socket';
import { msg } from '../messages/index';
import { tick } from './tick';

export const start = (appState: AppState, data: ServerMsg['startObserverData']) => {
  const mapOrigin = projectGeoToMap(config.origin);

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

  const state: ObserverState = {
    type: 'observer',
    time: now,
    prevTime: now,
    restartTime: 0,
    duration: data.duration,
    origin: [mapOrigin[0], mapOrigin[1], 0],
    players,
    bodies,
    renderer: view.createRenderer(),
    scene: view.createScene(),
    map: view.createMap(),
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

  appState.observer = state;

  bodies.forEach((body) => addBody(state, body));

  state.callbacks.resize = () => {
    view.resize(state.map, state.camera.object, state.renderer);
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
