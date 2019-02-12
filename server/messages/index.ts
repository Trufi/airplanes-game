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
    body: {
      id: body.id,
      position: body.position,
      rotation: body.rotation,
      velocity: body.velocity,
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

export interface TickBodyData {
  id: number;
  updateTime: number;
  position: number[];
  rotation: number[];
}

const getTickBodyData = ({ id, position, rotation, updateTime }: Airplane): TickBodyData => ({
  id,
  position,
  rotation,
  updateTime,
});

const tickData = (state: State) => {
  const bodies: TickBodyData[] = [];
  state.bodies.map.forEach((body) => bodies.push(getTickBodyData(body)));

  return {
    type: 'tickData' as 'tickData',
    bodies,
  };
};

export const msg = {
  startData,
  playerEnter,
  playerLeave,
  tickData,
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
