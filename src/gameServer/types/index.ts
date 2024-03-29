import * as ws from 'ws';
import { GameType, City } from '../../types';
import { HealPointsState } from '../games/healPoints';

export interface InitialConnection {
  status: 'initial';
  id: number;
  socket: ws;

  /**
   * Используется для пинга и для удаления, если не отвечает
   */
  isAlive: boolean;
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

  /**
   * Используется для пинга и для удаления, если не отвечает
   */
  isAlive: boolean;
}

export interface ObserverConnection {
  status: 'observer';
  id: number;
  socket: ws;

  /**
   * Этот id присылает нам главный сервер
   */
  userId: number;
  name: string;

  /**
   * Используется для пинга и для удаления, если не отвечает
   */
  isAlive: boolean;
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
  userId: number;
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
  userId: number;
  name: string;
}

export interface GameState {
  prevTime: number;
  time: number;
  bodies: BodiesState;
  players: Map<number, GamePlayer>;
  observers: Map<number, GameObserver>;
  restart: {
    need: boolean;
    time: number;
    duration: number;
    tournamentId: number;
    isGrandFinal: boolean;
  };
  city: City;
  startTime: number;
  tournamentId: number;
  isGrandFinal: boolean;
  duration: number;
  maxPlayers: number;
  healPoints: HealPointsState;
}

export interface State {
  type: GameType;
  url: string;
  connections: ConnectionsState;
  game: GameState;
}

export interface RestartData {
  tournamentId: number;
  inSeconds: number;
  duration: number;
  isGrandFinal: boolean;
}
