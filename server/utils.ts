import { State, Connection } from './types';

export const getConnectionByPlayerId = (state: State, playerId: number): Connection | undefined => {
  const player = state.players.map.get(playerId);
  if (player) {
    return state.connections.map.get(player.connectionId);
  }
};

// TODO: переделать на более точное
export const time = () => Date.now();

export const getPlayerAndBody = (state: State, playerId: number) => {
  const player = state.players.map.get(playerId);
  if (!player) {
    return;
  }
  const body = state.bodies.map.get(player.bodyId);
  if (!body) {
    return;
  }
  return { player, body };
};

export const getBodyByPlayerId = (state: State, playerId: number) => {
  const player = state.players.map.get(playerId);
  if (!player) {
    return;
  }
  const body = state.bodies.map.get(player.bodyId);
  if (!body) {
    return;
  }
  return body;
};

export function clamp(value: number, min: number, max: number) {
  value = Math.max(value, min);
  value = Math.min(value, max);
  return value;
}
