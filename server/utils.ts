import { State, Connection } from './types';

export const getConnectionByPlayerId = (state: State, playerId: number): Connection | undefined => {
  const player = state.players.map.get(playerId);
  if (player) {
    return state.connections.map.get(player.connectionId);
  }
};

// TODO: переделать на более точное
export const time = () => Date.now();
