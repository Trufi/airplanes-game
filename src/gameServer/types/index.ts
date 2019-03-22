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

export interface Weapon {
  lastShotTime: number;
}

export interface Body {
  id: number;
  playerId: number;
  updateTime: number;
  position: number[];
  rotation: number[];
  health: number;
  weapon: Weapon;

  prevSendingData: {
    position: number[];
    rotation: number[];
    updateTime: number;
    lastShotTime: number;
  };
}

export interface BodiesState {
  map: Map<number, Body>;
  nextId: number;
}

export interface GamePlayer {
  /**
   * id равен connectionId
   */
  id: number;
  name: string;
  bodyId: number;
  live: boolean;
  kills: number;
  deaths: number;
  points: number;
}

export interface GameObserver {
  /**
   * id равен connectionId
   */
  id: number;
  name: string;
}

export interface GameState {
  id: number;
  prevTime: number;
  time: number;
  bodies: BodiesState;
  players: Map<number, GamePlayer>;
  observers: Map<number, GameObserver>;
}

export interface State {
  connections: ConnectionsState;
  games: {
    map: Map<number, GameState>;
    nextId: number;
  };
}
