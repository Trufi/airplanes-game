import * as J from '@2gis/jakarta';
import * as THREE from 'three';
import { ObserverState } from './observer/types';
import { NotesState } from './common/notes';
import { ServerTimeState } from './common/serverTime';

export interface BodyStep {
  time: number;
  position: number[];
  rotation: number[];
  lastShotTime: number;
}

export interface Hit {
  bodyId: number;
}

export interface AnimationPerFrame {
  frames: number;
  is_running: boolean;
}

export interface WeaponState {
  heat: number;
  blocked: boolean;

  lastShotTime: number;
  lastHitTime: number;
  animation: AnimationPerFrame;
  hits: Hit[];
  left: THREE.Group;
  right: THREE.Group;
  target?: THREE.Vector3;
}

export interface BoostState {
  blocked: boolean;
  volume: number;
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
  boost: BoostState;
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
  health: number;
  weapon: {
    animation: AnimationPerFrame;
    lastShotTime: number;
    left: THREE.Group;
    right: THREE.Group;
    target?: THREE.Vector3;
  };
  steps: BodyStep[];
}

export type BodyState = PhysicBodyState | NonPhysicBodyState;

export interface PlayerState {
  id: number;
  bodyId: number;
  name: string;
  live: boolean;
  kills: number;
  deaths: number;
  points: number;
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

export interface ShooterState {
  direction: number[];
  hitTime: number;
}

export interface DamageIndicatorState {
  prevCheckHealth: number;
  shooters: Map<number, ShooterState>;
}

export interface State {
  type: 'game';
  time: number;
  prevTime: number;

  restartTime: number;
  duration: number;

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

  damageIndicator: DamageIndicatorState;
}

// TODO: Разбить на несколько
export interface AppState {
  type: 'login' | 'gameSelect' | 'game' | 'observer';
  id?: number; // connection id на сервере
  connected?: boolean;
  name?: string;
  token?: string;
  game?: State;
  observer?: ObserverState;
  tryJoin?: {
    url: string;
    type: 'player' | 'observer' | 'bot';
  };
}
