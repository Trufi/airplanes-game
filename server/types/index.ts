import * as ws from 'ws';

export interface InitialConnection {
  status: 'initial';
  id: number;
  socket: ws;
}

export interface PlayerConnection {
  status: 'player';
  id: number;
  socket: ws;
  playerId: number;
}

export type Connection = InitialConnection | PlayerConnection;

export interface ConnectionsState {
  map: Map<number, Connection>;
  nextId: number;
}

export interface Player {
  id: number;
  connectionId: number;
  name: string;
  bodyId: number;
}

export interface PlayersState {
  map: Map<number, Player>;
  nextId: number;
}

export interface Airplane {
  id: number;
  updateTime: number;
  position: number[];
  rotation: number[];
  velocity: number[];
}

export interface BodiesState {
  map: Map<number, Airplane>;
  nextId: number;
}

export interface State {
  prevTime: number;
  time: number;
  connections: ConnectionsState;
  players: PlayersState;
  bodies: BodiesState;
}
