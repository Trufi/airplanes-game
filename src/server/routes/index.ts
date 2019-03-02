import { Express } from 'express';
import { mapMap } from '../../utils';
import * as game from '../games/game';
import { State } from '../types';
import { applyApiRouter } from './apiRouter';

export function applyRouter(app: Express, state: State) {
  app.get('/state', (_req, res) => {
    const data = {
      games: mapMap(state.games.map, game.debugInfo),
      connections: Array.from(state.connections.map).map((v) => {
        const { id, status } = v[1];
        return {
          id,
          status,
        };
      }),
    };
    res.send(JSON.stringify(data, null, 2));
  });

  applyApiRouter(app);
}
