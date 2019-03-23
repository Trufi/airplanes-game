import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { State, PlayerState } from '../../types';
import { AnyServerMsg, ServerMsg, PbfTickBodyData } from '../../../gameServer/messages';
import { Cmd } from '../../commands';
import { createPlayer, createNonPhysicBody, addBody, createPhysicBody } from '../common';
import { updatePingAndServerTime } from '../../common/serverTime';
import { addKillNote } from '../../common/notes';
import { ObserverState } from '../../observer/types';
import { getNewPoints } from '../../../utils';
import * as config from '../../../config';

export const message = (state: State, msg: AnyServerMsg): Cmd => {
  switch (msg.type) {
    case 'tickData':
      return updateGameData(state, msg);
    case 'playerEnter':
      return playerEnter(state, msg);
    case 'playerLeave':
      return removePlayer(state, msg);
    case 'playerDeath':
      return playerDeath(state, msg);
    case 'playerNewBody':
      return playerNewBody(state, msg);
    case 'pong':
      return updatePingAndServerTime(state.serverTime, msg);
    case 'restartAt':
      return restartAt(state, msg);
    case 'restartData':
      return restartData(state, msg);
  }
};

export const updateGameData = (state: State | ObserverState, msg: ServerMsg['tickData']) => {
  msg.bodies.forEach((body) => updateBodyData(state, body));
};

export const updateBodyData = (state: State | ObserverState, data: PbfTickBodyData) => {
  const { id, position, rotation, updateTime, health, lastShotTime } = data;

  const bodyState = state.bodies.get(id);
  if (!bodyState) {
    return;
  }

  // Здоровье меняем сразу
  bodyState.health = health;

  if (bodyState.type === 'nonPhysic') {
    const lastStep = bodyState.steps[bodyState.steps.length - 1];
    const newStep = {
      position: [position.x, position.y, position.z],
      rotation: [rotation.x, rotation.y, rotation.z, rotation.w],
      lastShotTime,
      time: updateTime,
    };
    vec3.scale(newStep.position, newStep.position, 1 / config.compression.position);
    vec3.add(newStep.position, newStep.position, lastStep.position);

    quat.scale(newStep.rotation, newStep.rotation, 1 / config.compression.rotation);
    quat.add(newStep.rotation, newStep.rotation, lastStep.rotation);
    quat.normalize(newStep.rotation, newStep.rotation);

    newStep.lastShotTime += lastStep.lastShotTime;
    newStep.time += lastStep.time;

    bodyState.steps.push(newStep);
  }
};

export const playerEnter = (state: State | ObserverState, msg: ServerMsg['playerEnter']) => {
  // Себя не добавляем
  if (state.type === 'game' && state.player.id === msg.player.id) {
    return;
  }

  const body = createNonPhysicBody(msg.body);
  addBody(state, body);

  const player = createPlayer(msg.player);
  state.players.set(player.id, player);

  if (player && body) {
    body.playerId = player.id;
  }
};

export const removePlayer = (state: State | ObserverState, msg: ServerMsg['playerLeave']) => {
  const player = state.players.get(msg.playerId);
  if (!player) {
    return;
  }
  removeBody(state, player.bodyId);
  state.players.delete(player.id);
};

const removeBody = (state: State | ObserverState, bodyId: number) => {
  const body = state.bodies.get(bodyId);
  if (body) {
    state.bodies.delete(bodyId);
    state.scene.remove(body.mesh);
  }
  if (state.type === 'game' && state.body === body) {
    delete state.body;
  }
};

const getPlayer = (state: State | ObserverState, id: number) => {
  let player: PlayerState | undefined;

  // может игрок это мы
  if (state.type === 'game' && state.player.id === id) {
    player = state.player;
  } else {
    player = state.players.get(id);
  }

  return player;
};

export const playerDeath = (state: State | ObserverState, msg: ServerMsg['playerDeath']) => {
  const { playerId, causePlayerId } = msg;

  const causePlayer = getPlayer(state, causePlayerId);
  if (causePlayer) {
    causePlayer.kills++;
    causePlayer.points = getNewPoints(causePlayer.points, 'kills');
  }

  const player = getPlayer(state, playerId);
  if (player) {
    player.live = false;
    player.deaths++;
    player.points = getNewPoints(player.points, 'deaths');
    removeBody(state, player.bodyId);
  }

  // Добавляем сообщение о смерти
  addKillNote(state.notes, state.time, causePlayerId, playerId);
};

export const playerNewBody = (state: State | ObserverState, msg: ServerMsg['playerNewBody']) => {
  const player = getPlayer(state, msg.playerId);
  if (!player) {
    return;
  }

  if (state.type === 'game' && state.player === player) {
    const body = createPhysicBody(msg.body);
    addBody(state, body);
    state.player.bodyId = body.id;
    state.body = body;
  } else {
    const body = createNonPhysicBody(msg.body);
    addBody(state, body);
    player.bodyId = msg.body.id;
  }
};

export const restartAt = (state: State | ObserverState, msg: ServerMsg['restartAt']) => {
  const { time } = msg;
  state.restartTime = time + state.serverTime.diff;
};

export const restartData = (state: State | ObserverState, msg: ServerMsg['restartData']) => {
  const { endTime, players, bodies } = msg;

  state.serverEndTime = endTime;

  players.forEach(({ id, bodyId, kills, deaths, points, live }) => {
    const player = getPlayer(state, id);
    if (!player) {
      return;
    }

    player.bodyId = bodyId;
    player.kills = kills;
    player.deaths = deaths;
    player.points = points;
    player.live = live;
  });

  state.bodies.forEach((body) => removeBody(state, body.id));

  bodies.forEach((bodyData) => {
    if (state.type === 'game' && state.player.bodyId === bodyData.id) {
      const body = createPhysicBody(bodyData);
      addBody(state, body);
      state.body = body;
    } else {
      addBody(state, createNonPhysicBody(bodyData));
    }
  });
};
