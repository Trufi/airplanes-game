import { State, Game } from './types';
import { NotifyRequest } from './types/gameApi';
import * as config from '../config';

export const updateGameData = (state: State, data: NotifyRequest) => {
  const { city, url, maxPlayers, players, tournamentId, isGrandFinal, type, enable } = data;
  const now = Date.now();

  const game = state.games.byUrl.get(url);
  if (game) {
    game.players = players;
    game.maxPlayers = maxPlayers;
    game.city = city;
    game.type = type;
    game.lastNotifyTime = now;
    game.tournamentId = tournamentId;
    game.isGrandFinal = isGrandFinal;
    game.enable = enable;
  } else {
    const game: Game = {
      id: state.games.nextId,
      type,
      url,
      players,
      maxPlayers,
      city,
      lastNotifyTime: now,
      tournamentId,
      isGrandFinal,
      enable,
    };
    state.games.nextId++;
    state.games.map.set(game.id, game);
    state.games.byUrl.set(game.url, game);
    console.log(
      `Register new game server with id: ${game.id}, tournamentId: ${tournamentId}, ` +
        `isGrandfinal: ${isGrandFinal}, url: ${url}`,
    );
  }
};

export const clearOldGames = (state: State) => {
  const now = Date.now();

  state.games.map.forEach((game, key) => {
    if (now - game.lastNotifyTime > config.mainServer.clearGameThreshold) {
      console.log(`Delete old game server with id: ${game.id}, url: ${game.url}`);
      state.games.map.delete(key);
      state.games.byUrl.delete(game.url);
    }
  });
};
