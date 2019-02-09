import { ServerMsg, PlayerLeaveServerMsg, TickDataServerMsg } from '../../types/serverMsg';
import { Connection, State } from '../types';

export const getConnectionByPlayerId = (state: State, playerId: number): Connection | undefined => {
  const player = state.players.map.get(playerId);
  if (player) {
    return state.connections.map.get(player.connectionId);
  }
};

export const getStartDataMsg = (state: State, playerId: number): ServerMsg | undefined => {
  const player = state.players.map.get(playerId);
  if (!player) {
    return;
  }

  return {
    type: 'startData',
    data: {
      id: player.id,
    },
  };
};

export const getPlayerLeaveMsg = (playerId: number): PlayerLeaveServerMsg => {
  return {
    type: 'playerLeave',
    data: {
      playerId,
    },
  };
};

export const getTickDataMsg = (_state: State): TickDataServerMsg => {
  return {
    type: 'tickData',
  };
};
