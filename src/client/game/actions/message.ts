import { State, ServerTimeState } from '../../types';
import { AnyServerMsg, ServerMsg, TickBodyData } from '../../../server/messages';
import { median, time } from '../../utils';
import { Cmd } from '../../commands';
import { createPlayer, createNonPhysicBody, addBody } from '../common';

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
    case 'pong':
      return updatePingAndServerTime(state.serverTime, msg);
  }
};

const updateGameData = (state: State, msg: ServerMsg['tickData']) => {
  msg.bodies.forEach((body) => updateBodyData(state, body));
};

const updateBodyData = (state: State, data: TickBodyData) => {
  const { id, position, rotation, updateTime, velocityDirection, health, weapon } = data;

  const bodyState = state.bodies.get(id);
  if (!bodyState) {
    return;
  }

  if (bodyState.type === 'physic') {
    bodyState.health = data.health;
  } else {
    bodyState.steps.push({
      position,
      rotation,
      velocityDirection,
      health,
      weapon,
      time: updateTime,
    });
  }
};

const playerEnter = (state: State, msg: ServerMsg['playerEnter']) => {
  const body = createNonPhysicBody(msg.body);
  addBody(state, body);

  const player = createPlayer(msg.player);
  state.players.set(player.id, player);

  if (player && body) {
    body.playerId = player.id;
  }
};

const removePlayer = (state: State, msg: ServerMsg['playerLeave']) => {
  const player = state.players.get(msg.playerId);
  if (!player) {
    return;
  }
  removeBody(state, player.bodyId);
  state.players.delete(player.id);
};

const removeBody = (state: State, bodyId: number) => {
  const body = state.bodies.get(bodyId);
  if (body) {
    state.bodies.delete(bodyId);
    state.scene.remove(body.mesh);
  }
};

const playerDeath = (state: State, msg: ServerMsg['playerDeath']) => {
  const { playerId, causePlayerId } = msg;

  if (playerId === state.player.id) {
    state.player.live = false;
  } else {
    // Добавляем сообщение о смерти
    state.deathNotes.push({
      time: state.time,
      causePlayerId,
      deadPlayerId: playerId,
    });

    const player = state.players.get(playerId);
    if (player) {
      removeBody(state, player.bodyId);
    }
  }
};

const updatePingAndServerTime = (timeState: ServerTimeState, msg: ServerMsg['pong']) => {
  const { pingSample, diffSample } = timeState;
  const maxSampleLength = 10;

  const ping = time() - msg.clientTime;
  pingSample.push(ping);
  if (pingSample.length > maxSampleLength) {
    pingSample.shift();
  }

  timeState.ping = median(pingSample);

  const diff = msg.clientTime + ping / 2 - msg.serverTime;
  diffSample.push(diff);
  if (diffSample.length > maxSampleLength) {
    diffSample.shift();
  }

  timeState.diff = median(diffSample);
};
