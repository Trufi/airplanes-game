import { State, NonPhysicBodyState, PlayerState, ServerTimeState } from '../types';
import { createMesh, createShotMesh } from '../view';
import { AnyServerMsg, ServerMsg, TickBodyData, AnotherPlayer } from '../../server/messages';
import { time, median } from '../utils';

export const message = (state: State, msg: AnyServerMsg) => {
  switch (msg.type) {
    case 'startData':
      createSession(state, msg);
      break;
    case 'tickData':
      updateGameData(state, msg);
      break;
    case 'playerEnter':
      createPlayer(state, msg);
      break;
    case 'playerLeave':
      removePlayer(state, msg);
      break;
    case 'pong':
      updatePingAndServerTime(state.serverTime, msg);
  }
};

const createSession = (state: State, msg: ServerMsg['startData']) => {
  state.session = {
    id: msg.id,
    name: msg.name,
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

  state.session.body.mesh.add(state.session.body.shotMesh);
  state.scene.add(state.session.body.mesh);

  msg.anotherPlayers.forEach((anotherPlayer) => {
    createPlayer(state, anotherPlayer);
  });
};

const updateGameData = (state: State, msg: ServerMsg['tickData']) => {
  msg.bodies.forEach((body) => updateBodyData(state, body));
};

const updateBodyData = (state: State, data: TickBodyData) => {
  const { id, position, rotation, updateTime, velocityDirection, health, weapon } = data;

  // Собственный самолет не обновляем
  if (state.session && state.session.id === id) {
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

const createPlayer = (state: State, { id, name, bodyId }: AnotherPlayer) => {
  // Себя добавляем через отдельный механизм
  if (!state.session || state.session.id === id) {
    return;
  }
  createBody(state, id, bodyId);

  const player: PlayerState = {
    id,
    bodyId,
    name,
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
  const body = state.bodies.get(player.bodyId);
  if (body) {
    state.bodies.delete(player.bodyId);
    state.scene.remove(body);
  }
  state.players.delete(player.id);
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
