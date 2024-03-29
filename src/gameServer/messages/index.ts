import { ObjectElement, mapMap, pick } from '../../utils';
import { GameState, Body, GamePlayer } from '../types';
import * as config from '../../config';
import { HealPoint } from '../games/healPoints';

const serverMsgSchema = require('../../protobuf/serverMsg.proto');
const Pbf = require('pbf');

const connect = (id: number) => ({
  type: 'connect' as 'connect',
  id,
});

const gameJoinFail = () => ({
  type: 'gameJoinFail' as 'gameJoinFail',
});

const getPlayerData = (player: GamePlayer) =>
  pick(player, ['id', 'live', 'name', 'bodyId', 'kills', 'deaths', 'points']);
export type PlayerData = ReturnType<typeof getPlayerData>;

const getTickBodyData = (body: Body) =>
  pick(body, ['id', 'position', 'rotation', 'updateTime', 'health', 'weapon']);
export type TickBodyData = ReturnType<typeof getTickBodyData>;

const getHealPointsData = (hp: HealPoint) => pick(hp, ['id', 'live', 'position']);
export type HealPointData = ReturnType<typeof getHealPointsData>;

const startData = (game: GameState, player: GamePlayer) => {
  const players = mapMap(game.players, getPlayerData);
  const bodies = mapMap(game.bodies.map, getTickBodyData);
  const healPoints = mapMap(game.healPoints.points, getHealPointsData);

  return {
    type: 'startData' as 'startData',
    playerId: player.id,
    endTime: game.startTime + game.duration,
    players,
    bodies,
    healPoints,
    city: game.city,
  };
};

const startObserverData = (game: GameState) => {
  const players = mapMap(game.players, getPlayerData);
  const bodies = mapMap(game.bodies.map, getTickBodyData);
  const healPoints = mapMap(game.healPoints.points, getHealPointsData);

  return {
    type: 'startObserverData' as 'startObserverData',
    endTime: game.startTime + game.duration,
    players,
    bodies,
    healPoints,
    city: game.city,
  };
};

const restartData = (game: GameState) => {
  const players = mapMap(game.players, getPlayerData);
  const bodies = mapMap(game.bodies.map, getTickBodyData);
  const healPoints = mapMap(game.healPoints.points, getHealPointsData);

  return {
    type: 'restartData' as 'restartData',
    endTime: game.startTime + game.duration,
    players,
    bodies,
    healPoints,
  };
};

const playerEnter = (player: GamePlayer, body: Body) => ({
  type: 'playerEnter' as 'playerEnter',
  player: getPlayerData(player),
  body: getTickBodyData(body),
});

const playerNewBody = (player: GamePlayer, body: Body) => ({
  type: 'playerNewBody' as 'playerNewBody',
  playerId: player.id,
  body: getTickBodyData(body),
});

const playerLeave = (playerId: number) => ({
  type: 'playerLeave' as 'playerLeave',
  playerId,
});

const playerDeath = (playerId: number, causePlayerId: number) => ({
  type: 'playerDeath' as 'playerDeath',
  playerId,
  causePlayerId,
});

const getDelta = (out: Body['prevSendingData'], body: Body) => {
  const { prevSendingData: prev } = body;
  const posRound = config.compression.position;
  const rotRound = config.compression.rotation;

  out.position[0] = ((body.position[0] - prev.position[0]) * posRound) | 0;
  out.position[1] = ((body.position[1] - prev.position[1]) * posRound) | 0;
  out.position[2] = ((body.position[2] - prev.position[2]) * posRound) | 0;

  prev.position[0] = prev.position[0] + out.position[0] / posRound;
  prev.position[1] = prev.position[1] + out.position[1] / posRound;
  prev.position[2] = prev.position[2] + out.position[2] / posRound;

  out.rotation[0] = ((body.rotation[0] - prev.rotation[0]) * rotRound) | 0;
  out.rotation[1] = ((body.rotation[1] - prev.rotation[1]) * rotRound) | 0;
  out.rotation[2] = ((body.rotation[2] - prev.rotation[2]) * rotRound) | 0;
  out.rotation[3] = ((body.rotation[3] - prev.rotation[3]) * rotRound) | 0;

  prev.rotation[0] = prev.rotation[0] + out.rotation[0] / rotRound;
  prev.rotation[1] = prev.rotation[1] + out.rotation[1] / rotRound;
  prev.rotation[2] = prev.rotation[2] + out.rotation[2] / rotRound;
  prev.rotation[3] = prev.rotation[3] + out.rotation[3] / rotRound;

  out.lastShotTime = (body.weapon.lastShotTime - prev.lastShotTime) | 0;
  prev.lastShotTime += out.lastShotTime;

  out.updateTime = (body.updateTime - prev.updateTime) | 0;
  prev.updateTime += out.updateTime;
};

const delta: Body['prevSendingData'] = {
  position: [0, 0, 0],
  rotation: [0, 0, 0, 0],
  lastShotTime: 0,
  updateTime: 0,
};

const getPbfTickBodyData = (body: Body) => {
  const { id, health } = body;

  getDelta(delta, body);

  const { position, rotation, updateTime, lastShotTime } = delta;

  return {
    id,
    position: {
      x: position[0],
      y: position[1],
      z: position[2],
    },
    rotation: {
      x: rotation[0],
      y: rotation[1],
      z: rotation[2],
      w: rotation[3],
    },
    updateTime,
    health,
    lastShotTime,
  };
};
export type PbfTickBodyData = ReturnType<typeof getPbfTickBodyData>;

const tickData = (game: GameState) => {
  return {
    type: 'tickData' as 'tickData',
    bodies: mapMap(game.bodies.map, getPbfTickBodyData),
  };
};

const pong = (serverTime: number, clientTime: number) => ({
  type: 'pong' as 'pong',
  serverTime,
  clientTime,
});

const restartAt = (game: GameState) => ({
  type: 'restartAt' as 'restartAt',
  time: game.restart.time,
});

const healPointAlive = (id: number) => ({
  type: 'healPointAlive' as 'healPointAlive',
  id,
});

const healPointWasTaken = (id: number) => ({
  type: 'healPointWasTaken' as 'healPointWasTaken',
  id,
});

export const msg = {
  connect,
  gameJoinFail,
  startData,
  startObserverData,
  playerEnter,
  playerNewBody,
  playerLeave,
  playerDeath,
  tickData,
  pong,
  restartAt,
  restartData,
  healPointAlive,
  healPointWasTaken,
};

export const pbfMsg = {
  tickData: (game: GameState) => {
    const pbf = new Pbf();
    const msg = tickData(game);
    serverMsgSchema.TickData.write(msg, pbf);
    const u8 = pbf.finish() as Uint8Array;
    return u8.buffer.slice(0, u8.byteLength);
  },
};

/**
 * Union тип всех сообщений сервера
 */
export type AnyServerMsg = ReturnType<ObjectElement<typeof msg>>;

type MsgMap = typeof msg;
/**
 * Мапа всех сообщений сервера, с помощью которой можно получить конкретное:
 * type TickDataMsg = ServerMsg['tickData'];
 */
export type ServerMsg = { [K in keyof MsgMap]: ReturnType<MsgMap[K]> };
