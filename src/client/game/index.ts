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
import { createHealPointsState, setHealPointState } from './actions/healPoints';

export const start = (data: ServerMsg['startData']) => {
  if (!appState.id) {
    return;
  }

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
    restartTime: 0,
    serverEndTime: data.endTime,
    player: currentPlayer,
    body: currentBody,
    origin: [config.origin[0], config.origin[1], 0],
    players,
    bodies,
    healPoints: createHealPointsState(),
    renderer: view.createRenderer(),
    scene: view.createScene(),
    camera: view.createCamera(),
    serverTime: createServerTimeState(now),
    pressedKeys: {},
    notes: createNotesState(),
    stick: { x: 0, y: 0 },
    damageIndicator: createDamageIndicatorState(),
  };
  appState.game = state;
  state.bodies.forEach((body) => addBody(state, body));

  setHealPointState(state, data.healPoints);

  view.createMap();

  window.addEventListener('keydown', (ev) => {
    state.pressedKeys[ev.code] = true;
  });

  window.addEventListener('keyup', (ev) => {
    state.pressedKeys[ev.code] = false;
  });

  window.addEventListener('resize', () => {
    view.resize(state.camera.object, state.renderer);
  });
  view.resize(state.camera.object, state.renderer);

  function loop() {
    requestAnimationFrame(loop);

    const now = time();

    executeCmd(tick(state, now));

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
