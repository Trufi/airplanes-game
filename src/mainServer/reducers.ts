import { State, Game } from './types';

export interface GameData {
  token: string;
  name: string;
  url: string;
}

export const addGame = (state: State, data: GameData) => {
  const { name, url, token } = data;

  const game: Game = {
    id: state.games.nextId,
    token,
    name,
    url,
    players: 0,
  };
  state.games.nextId++;
  state.games.map.set(game.id, game);
  state.games.byToken.set(game.token, game);
  return game.id;
};

export interface UpdateGameData {
  token: string;
  players: number;
}

export const updateGame = (state: State, data: UpdateGameData) => {
  const { token, players } = data;
  const game = state.games.byToken.get(token);
  if (!game) {
    return new Error('Game not found');
  }

  game.players = players;
};
