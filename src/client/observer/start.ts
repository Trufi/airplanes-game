import { projectGeoToMap } from '@2gis/jakarta/dist/es6/utils/geo';
import { ObserverState } from './types';
import { ServerMsg } from '../../server/messages';
import { addBody, createPlayer, createNonPhysicBody } from '../game/common';
import * as config from '../../config';
import * as view from '../game/view';
import { createServerTimeState } from '../common/serverTime';
import { createNotesState } from '../common/notes';
import { AppState } from '../types';
import { time } from '../utils';
import { renderUI } from '../ui';
import { executeCmd } from '../commands/execute';
import { sendMessage } from '../socket';
import { msg } from '../messages';

export const start = (appState: AppState, data: ServerMsg['startData']) => {
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

  const state: ObserverState = {
    time: now,
    prevTime: now,
    origin: [mapOrigin[0], mapOrigin[1], 0],
    players,
    bodies,
    renderer: view.createRenderer(),
    scene: view.createScene(),
    map: view.createMap(),
    camera: view.createCamera(),
    serverTime: createServerTimeState(),
    pressedKeys: {},
    notes: createNotesState(),
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
    view.resize(state.map, state.camera.object);
  };
  window.addEventListener('resize', state.callbacks.resize);

  const loopCallback = () => {
    state.callbacks.loopId = requestAnimationFrame(loopCallback);

    // const now = time();

    state.renderer.render(state.scene, state.camera.object);
    renderUI(appState, executeCmd);
  };
  state.callbacks.loop = loopCallback;
  loopCallback();

  state.callbacks.ping = () => sendMessage(msg.ping(time()));
  state.callbacks.pingId = window.setInterval(
    state.callbacks.ping,
    config.clientSendChangesInterval,
  );
};
