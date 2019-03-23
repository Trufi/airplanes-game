import { Express } from 'express';
import { State } from '../types';
import { applyApiRouter } from './apiRouter';
import { applyGameServerRouter } from './gameServerRouter';
import { applyRemoteControl } from './remoteControl';

export function applyRouter(app: Express, state: State) {
  applyApiRouter(app, state);
  applyGameServerRouter(app, state);
  applyRemoteControl(app, state);
}
