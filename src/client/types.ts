import * as J from '@2gis/jakarta';
import * as THREE from 'three';
import { ObserverState } from './observer/types';
import { NotesState } from './common/notes';

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
  lastHitTime: number;
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

export interface StickState {
  x: number;
  y: number;
}

export interface CameraState {
  position: number[];
  rotation: number[];
  object: THREE.PerspectiveCamera;
}

export interface State {
  type: 'game';
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
  renderer: THREE.WebGLRenderer;
  camera: CameraState;

  map: J.Map;
  bodies: Map<number, BodyState>;
  serverTime: ServerTimeState;
  pressedKeys: { [key: string]: boolean };

  notes: NotesState;

  stick: StickState;
}

// TODO: Разбить на несколько
export interface AppState {
  type: 'login' | 'gameSelect' | 'game' | 'observer';
  connected: boolean;
  id?: number; // connection id на сервере
  name?: string;
  token?: string;
  game?: State;
  observer?: ObserverState;
}
