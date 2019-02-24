import { State, NonPhysicBodyState, PlayerState, ServerTimeState } from '../types';
import { createMesh, createShotMesh } from '../view';
import { AnyServerMsg, ServerMsg, TickBodyData, AnotherPlayer } from '../../server/messages';
import { time, median } from '../utils';
import { Cmd, cmd } from '../commands';

export const message = (state: State, msg: AnyServerMsg): Cmd => {
  switch (msg.type) {
    case 'connect':
      return saveConnectId(state, msg);
    case 'loginSuccess':
      return loginSuccess(state, msg);
    case 'startData':
      return createGame(state, msg);
    case 'tickData':
      return updateGameData(state, msg);
    case 'playerEnter':
      return createPlayer(state, msg.player);
    case 'playerLeave':
      return removePlayer(state, msg);
    case 'playerDeath':
      return playerDeath(state, msg);
    case 'pong':
      return updatePingAndServerTime(state.serverTime, msg);
  }
};

const saveConnectId = (state: State, msg: ServerMsg['connect']): Cmd => {
  state.id = msg.id;
};

const loginSuccess = (state: State, msg: ServerMsg['loginSuccess']): Cmd => {
  state.name = msg.name;
  state.gameList = msg.game;
  return cmd.renderUI();
};

const createGame = (state: State, msg: ServerMsg['startData']): Cmd => {
  state.game = {
    id: msg.id,
    name: msg.name,
    live: true,
    body: {
      position: msg.body.position,
      velocity: msg.body.velocity,
      velocityDirection: [0, 0, 0], // TODO: принимать с сервера
      rotation: msg.body.rotation,
      mesh: createMesh(),
      shotMesh: createShotMesh(),
      weapon: {
        lastShotTime: 0,
        hits: [],
      },
    },
  };

  state.game.body.mesh.add(state.game.body.shotMesh);
  state.scene.add(state.game.body.mesh);

  msg.anotherPlayers.forEach((anotherPlayer) => {
    createPlayer(state, anotherPlayer);
  });

  return cmd.saveNameToLocalStorage(msg.name);
};

const updateGameData = (state: State, msg: ServerMsg['tickData']) => {
  msg.bodies.forEach((body) => updateBodyData(state, body));
};

const updateBodyData = (state: State, data: TickBodyData) => {
  const { id, position, rotation, updateTime, velocityDirection, health, weapon } = data;

  // Собственный самолет не обновляем
  if (state.game && state.game.id === id) {
    return;
  }

  const bodyState = state.bodies.get(id);
  if (!bodyState) {
    return;
  }

  bodyState.steps.push({
    position,
    rotation,
    velocityDirection,
    health,
    weapon,
    time: updateTime,
  });
};

const createPlayer = (state: State, { id, name, bodyId, live }: AnotherPlayer) => {
  // Себя добавляем через отдельный механизм
  if (!state.game || state.game.id === id) {
    return;
  }
  createBody(state, id, bodyId);

  const player: PlayerState = {
    id,
    bodyId,
    name,
    live,
  };
  state.players.set(player.id, player);
};

const createBody = (state: State, playerId: number, id: number) => {
  const body: NonPhysicBodyState = {
    id,
    playerId,
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    velocityDirection: [0, 0, 0],
    health: 100,
    steps: [],
    mesh: createMesh(),
    shotMesh: createShotMesh(),
    weapon: {
      lastShotTime: 0,
    },
  };
  state.bodies.set(id, body);
  body.mesh.add(body.shotMesh);
  state.scene.add(body.mesh);
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

  if (playerId === state.id) {
    if (state.game) {
      state.game.live = false;
    }
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
