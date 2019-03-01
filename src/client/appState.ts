import { AppState } from './types';

const createAppState = (): AppState => ({
  type: 'login',
});

export const appState = createAppState();
