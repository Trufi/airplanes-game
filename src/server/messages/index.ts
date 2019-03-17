import { ObjectElement, mapMap, pick } from '../../utils';
import { GameState, Airplane, GamePlayer } from '../games/game';

const serverMsgSchema = require('../../protobuf/serverMsg.proto');
const Pbf = require('pbf');

const connect = (id: number) => ({
  type: 'connect' as 'connect',
  id,
});

const loginSuccess = (name: string, token: string, games: Map<number, GameState>) => {
  return {
    type: 'loginSuccess' as 'loginSuccess',
    name,
    token,
    game: mapMap(games, (game) => ({
      id: game.id,
    })),
  };
};

const loginFail = () => ({
  type: 'loginFail' as 'loginFail',
});

const gameJoinFail = () => ({
  type: 'gameJoinFail' as 'gameJoinFail',
});

const getPlayerData = (player: GamePlayer) =>
  pick(player, ['id', 'live', 'name', 'bodyId', 'kills', 'deaths', 'points']);
export type PlayerData = ReturnType<typeof getPlayerData>;

const getTickBodyData = (body: Airplane) =>
  pick(body, ['id', 'position', 'rotation', 'updateTime', 'health', 'weapon']);
export type TickBodyData = ReturnType<typeof getTickBodyData>;

const startData = (game: GameState, player: GamePlayer) => {
  const players = mapMap(game.players, getPlayerData);
  const bodies = mapMap(game.bodies.map, getTickBodyData);

  return {
    type: 'startData' as 'startData',
    playerId: player.id,
    name: player.name,

    players,
    bodies,
  };
};

const startObserverData = (game: GameState) => {
  const players = mapMap(game.players, getPlayerData);
  const bodies = mapMap(game.bodies.map, getTickBodyData);

  return {
    type: 'startObserverData' as 'startObserverData',
    players,
    bodies,
  };
};

const playerEnter = (player: GamePlayer, body: Airplane) => ({
  type: 'playerEnter' as 'playerEnter',
  player: getPlayerData(player),
  body: getTickBodyData(body),
});

const playerNewBody = (player: GamePlayer, body: Airplane) => ({
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

const getPbfTickBodyData = (body: Airplane) => {
  const {
    id,
    position,
    rotation,
    updateTime,
    health,
    weapon: { lastShotTime },
  } = body;

  return {
    id,
    position: {
      x: position[0] | 0,
      y: position[1] | 0,
      z: position[2] | 0,
    },
    rotation: {
      x: rotation[0],
      y: rotation[1],
      z: rotation[2],
      w: rotation[3],
    },
    updateTime: updateTime | 0,
    health: health | 0,
    lastShotTime: lastShotTime | 0,
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

export const msg = {
  connect,
  loginSuccess,
  loginFail,
  gameJoinFail,
  startData,
  startObserverData,
  playerEnter,
  playerNewBody,
  playerLeave,
  playerDeath,
  tickData,
  pong,
};

export const pbfMsg = {
  tickData: (game: GameState) => {
    const pbf = new Pbf();
    serverMsgSchema.TickData.write(tickData(game), pbf);
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
