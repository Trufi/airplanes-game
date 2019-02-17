import { State, Airplane, Player } from '../types';
import { ObjectElement } from '../../types/utils';

export interface AnotherPlayer {
  id: number;
  name: string;
  bodyId: number;
}

const startData = (state: State, player: Player, body: Airplane) => {
  const anotherPlayers: AnotherPlayer[] = [];
  state.players.map.forEach(({ id, bodyId, name }) => {
    // Самого игрока отправляем отдельно
    if (id === player.id) {
      return;
    }

    anotherPlayers.push({
      id,
      bodyId,
      name,
    });
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

const playerEnter = (player: Player) => ({
  type: 'playerEnter' as 'playerEnter',
  name: player.name,
  id: player.id,
  bodyId: player.bodyId,
});

const playerLeave = (playerId: number) => ({
  type: 'playerLeave' as 'playerLeave',
  playerId,
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

const tickData = (state: State) => {
  const bodies: TickBodyData[] = [];
  state.bodies.map.forEach((body) => bodies.push(getTickBodyData(body)));

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
  startData,
  playerEnter,
  playerLeave,
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
