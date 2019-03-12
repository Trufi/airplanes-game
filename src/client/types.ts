import * as J from '@2gis/jakarta';
import * as THREE from 'three';

export interface BodyStep {
  time: number;
  position: number[];
  rotation: number[];
  velocityDirection: number[];
  health: number;
  weapon: {
    lastShotTime: number;
  };
}

export interface Hit {
  bodyId: number;
}

export interface WeaponState {
  lastShotTime: number;
  hits: Hit[];
  left: THREE.Object3D;
  right: THREE.Object3D;
}

export interface PhysicBodyState {
  type: 'physic';
  id: number;
  playerId?: number;
  mesh: THREE.Object3D;
  shotMesh: THREE.Object3D;
  position: number[];
  velocity: number;
  rotation: number[];
  velocityDirection: number[];
  health: number;
  weapon: WeaponState;
  animation: THREE.AnimationMixer;
}

export interface NonPhysicBodyState {
  type: 'nonPhysic';
  id: number;
  playerId?: number;
  mesh: THREE.Object3D;
  shotMesh: THREE.Object3D;
  position: number[];
  velocity: number;
  rotation: number[];
  velocityDirection: number[];
  health: number;
  weapon: {
    lastShotTime: number;
    left: THREE.Object3D;
    right: THREE.Object3D;
  };
  steps: BodyStep[];
  animation: THREE.AnimationMixer;
}

export type BodyState = PhysicBodyState | NonPhysicBodyState;

export interface PlayerState {
  id: number;
  bodyId: number;
  name: string;
  live: boolean;
  kills: number;
  deaths: number;
}

export interface ServerTimeState {
  diffSample: number[];
  diff: number;

  pingSample: number[];
  ping: number;
}

export interface DeathNote {
  time: number;
  causePlayerId: number;
  deadPlayerId: number;
}

export interface StickState {
  x: number;
  y: number;
}

export interface State {
  time: number;
  prevTime: number;

  /**
   * Текущий игрок
   */
  player: PlayerState;

  /**
   * Тело текущего игрока
   * Если его нет, значит оно мертво
   */
  body?: PhysicBodyState;

  /**
   * Начало системы отсчета.
   * Нужен для того, чтобы глобальные координаты не выходили за int32 (максимум точности в шейдерах)
   */
  origin: number[];

  players: Map<number, PlayerState>;

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  map: J.Map;
  bodies: Map<number, PhysicBodyState | NonPhysicBodyState>;
  serverTime: ServerTimeState;
  pressedKeys: { [key: string]: boolean };

  deathNotes: DeathNote[];

  stick: StickState;
}

// TODO: Разбить на несколько
export interface AppState {
  type: 'login' | 'gameSelect' | 'game';
  connected: boolean;
  id?: number; // connection id на сервере
  name?: string;
  token?: string;
  game?: State;
}
