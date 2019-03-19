import { Express } from 'express';
import { State } from '../types';
import { applyApiRouter } from './apiRouter';
import { applyGameServerRouter } from './gameServerRouter';

export function applyRouter(app: Express, state: State) {
  applyApiRouter(app, state);
  applyGameServerRouter(app, state);
}
