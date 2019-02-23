import * as ws from 'ws';
import { GameState } from '../reducers/game';

export interface InitialConnection {
  status: 'initial';
  id: number;
  socket: ws;
}

export interface UserConnection {
  status: 'user';
  id: number;
  socket: ws;
  name: string;
}

export interface PlayerConnection {
  status: 'player';
  id: number;
  socket: ws;
  name: string;
  gameId: number;
}

export type Connection = InitialConnection | UserConnection | PlayerConnection;

export interface ConnectionsState {
  map: Map<number, Connection>;
  nextId: number;
}

export interface State {
  connections: ConnectionsState;
  games: {
    map: Map<number, GameState>;
    nextId: number;
  };
}
