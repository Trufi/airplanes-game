import { AppState } from './types';

const createAppState = (): AppState => ({
  type: 'login',
  connected: true,
});

export const appState = createAppState();
