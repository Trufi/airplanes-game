import { ObjectElement, mapMap, pick } from '../../utils';
import { GameState, Airplane, GamePlayer } from '../games/game';

const connect = (id: number) => ({
  type: 'connect' as 'connect',
  id,
});

const loginSuccess = (name: string, games: Map<number, GameState>) => {
  return {
    type: 'loginSuccess' as 'loginSuccess',
    name,
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

const getAnotherPlayer = (player: GamePlayer) => pick(player, ['id', 'live', 'name', 'bodyId']);

export type AnotherPlayer = ReturnType<typeof getAnotherPlayer>;

const startData = (game: GameState, player: GamePlayer, body: Airplane) => {
  const anotherPlayers: AnotherPlayer[] = [];

  game.players.forEach((p) => {
    // Самого игрока отправляем отдельно
    if (p.id === player.id) {
      return;
    }

    anotherPlayers.push(getAnotherPlayer(p));
  });

  return {
    type: 'startData' as 'startData',
    id: player.id,
    name: player.name,
    body: {
      id: body.id,
      position: body.position,
      rotation: body.rotation,
      velocity: body.velocity,
      velocityDirection: body.velocityDirection,
      health: body.health,
    },
    anotherPlayers,
  };
};

const playerEnter = (player: GamePlayer) => ({
  type: 'playerEnter' as 'playerEnter',
  player: getAnotherPlayer(player),
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

const getTickBodyData = ({
  id,
  position,
  rotation,
  velocityDirection,
  updateTime,
  health,
  weapon,
}: Airplane) => ({
  id,
  position,
  rotation,
  velocityDirection,
  updateTime,
  health,
  weapon,
});

export type TickBodyData = ReturnType<typeof getTickBodyData>;

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
  playerEnter,
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
