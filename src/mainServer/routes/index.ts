import { Express } from 'express';
import { State } from '../types';
import { applyApiRouter } from './apiRouter';
import { applyGameServerRouter } from './gameServerRouter';

export function applyRouter(app: Express, state: State) {
  applyApiRouter(app, state);
  applyGameServerRouter(app, state);

  app.get('/metrics', (_, res) => {
    let players = 0;
    state.games.map.forEach((game) => {
      players += game.players;
    });
    res.send(`
      # HELP sky_game_active_players Active players in game
      # TYPE sky_game_active_players gauge
      sky_game_active_players ${players || 0}
    `);
  });
}
