import { AppState } from './types';
import { parseQuery } from './utils';

const createAppState = (): AppState => ({
  type: 'login',
  query: parseQuery(),
});

export const appState = createAppState();
