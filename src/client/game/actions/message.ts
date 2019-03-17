import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { State } from '../../types';
import { AnyServerMsg, ServerMsg, PbfTickBodyData } from '../../../server/messages';
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

  if (bodyState.type === 'physic') {
    bodyState.health = data.health;
  } else {
    const lastStep = bodyState.steps[bodyState.steps.length - 1];
    const newStep = {
      position: [position.x, position.y, position.z],
      rotation: [rotation.x, rotation.y, rotation.z, rotation.w],
      health,
      weapon: {
        lastShotTime,
      },
      time: updateTime,
    };
    vec3.scale(newStep.position, newStep.position, 1 / config.compression.position);
    vec3.add(newStep.position, newStep.position, lastStep.position);

    quat.scale(newStep.rotation, newStep.rotation, 1 / config.compression.rotation);
    quat.add(newStep.rotation, newStep.rotation, lastStep.rotation);
    quat.normalize(newStep.rotation, newStep.rotation);

    newStep.weapon.lastShotTime += lastStep.weapon.lastShotTime;
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

export const playerDeath = (state: State | ObserverState, msg: ServerMsg['playerDeath']) => {
  const { playerId, causePlayerId } = msg;

  const causePlayer = state.players.get(causePlayerId);
  if (causePlayer) {
    causePlayer.kills++;
    causePlayer.points = getNewPoints(causePlayer.points, 'kills');
  }

  const player = state.players.get(playerId);
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
  if (state.type === 'game' && msg.playerId === state.player.id) {
    const body = createPhysicBody(msg.body);
    addBody(state, body);
    state.body = body;
  } else {
    const body = createNonPhysicBody(msg.body);
    addBody(state, body);
  }

  const player = state.players.get(msg.playerId);
  if (!player) {
    return;
  }

  player.bodyId = msg.body.id;
};
