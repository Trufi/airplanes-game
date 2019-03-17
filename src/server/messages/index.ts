import { ObjectElement, mapMap, pick } from '../../utils';
import { GameState, Airplane, GamePlayer } from '../games/game';

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

const tickData = (game: GameState) => {
  const bodies: TickBodyData[] = [];
  game.bodies.map.forEach((body) => bodies.push(getTickBodyData(body)));

  return {
    type: 'tickData' as 'tickData',
    bodies,
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
