import * as ws from 'ws';
import { GameState } from '../games/game';

export interface InitialConnection {
  status: 'initial';
  id: number;
  socket: ws;
}

export interface PlayerConnection {
  status: 'player';
  id: number;
  socket: ws;

  /**
   * Этот id присылает нам главный сервер
   */
  userId: number;
  name: string;
  gameId: number;
}

export interface ObserverConnection {
  status: 'observer';
  id: number;
  socket: ws;
  name: string;
  gameId: number;
}

export type Connection = InitialConnection | PlayerConnection | ObserverConnection;

export interface ConnectionsState {
  map: Map<number, Connection>;
  nextId: number;
}

export interface State {
  token: string;
  connections: ConnectionsState;
  games: {
    map: Map<number, GameState>;
    nextId: number;
  };
}
