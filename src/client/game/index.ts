import { projectGeoToMap } from '@2gis/jakarta/dist/es6/utils/geo';
import { msg, pbfMsg } from '../messages/index';
import { tick } from './actions/tick';
import { time } from '../utils';
import { renderUI } from '../ui';
import { executeCmd } from '../commands/execute';
import { sendMessage, sendPbfMessage } from '../socket';
import { ServerMsg } from '../../gameServer/messages';
import { appState } from '../appState';
import * as config from '../../config';
import * as view from './view';
import { addBody, createPlayer, createPhysicBody, createNonPhysicBody } from './common';
import { State, PlayerState, PhysicBodyState } from '../types';
import { createServerTimeState } from '../common/serverTime';
import { createNotesState } from '../common/notes';
import { createDamageIndicatorState } from './actions/damageIndicator';

export const start = (data: ServerMsg['startData']) => {
  if (!appState.id) {
    return;
  }

  const mapOrigin = projectGeoToMap(config.origin);

  const players: State['players'] = new Map();
  let currentPlayer: PlayerState | undefined;
  let currentBody: PhysicBodyState | undefined;

  data.players.forEach((playerData) => {
    const player = createPlayer(playerData);
    players.set(player.id, player);

    if (data.playerId === player.id) {
      currentPlayer = player;
    }
  });

  const bodies: State['bodies'] = new Map();
  data.bodies.forEach((bodyData) => {
    if (currentPlayer && bodyData.id === currentPlayer.bodyId) {
      const body = createPhysicBody(bodyData);
      currentBody = body;
      bodies.set(body.id, body);
    } else {
      const body = createNonPhysicBody(bodyData);
      bodies.set(body.id, body);
    }
  });

  if (!currentPlayer || !currentBody) {
    throw new Error('Current player and body not found');
  }

  const now = time();

  const state: State = {
    type: 'game',
    time: now,
    prevTime: now,
    player: currentPlayer,
    body: currentBody,
    origin: [mapOrigin[0], mapOrigin[1], 0],
    players,
    bodies,
    renderer: view.createRenderer(),
    scene: view.createScene(),
    map: view.createMap(),
    camera: view.createCamera(),
    serverTime: createServerTimeState(now),
    pressedKeys: {},
    notes: createNotesState(),
    stick: { x: 0, y: 0 },
    damageIndicator: createDamageIndicatorState(),
  };
  appState.game = state;
  state.bodies.forEach((body) => addBody(state, body));

  window.addEventListener('keydown', (ev) => {
    state.pressedKeys[ev.code] = true;
  });

  window.addEventListener('keyup', (ev) => {
    state.pressedKeys[ev.code] = false;
  });

  window.addEventListener('resize', () => {
    view.resize(state.map, state.camera.object, state.renderer);
  });
  view.resize(state.map, state.camera.object, state.renderer);

  function loop() {
    requestAnimationFrame(loop);

    const now = time();

    tick(state, now);

    state.renderer.render(state.scene, state.camera.object);
    renderUI(appState, executeCmd);
  }
  requestAnimationFrame(loop);

  setInterval(() => {
    if (!state.body) {
      return;
    }

    sendPbfMessage(pbfMsg.changes(state.body, state.time, state.serverTime.diff));

    // Сбрасываем попадания после отправки на сервер
    state.body.weapon.hits = [];
  }, config.clientSendChangesInterval);

  setInterval(() => {
    sendMessage(msg.ping(time()));
  }, config.clientPingInterval);
};
