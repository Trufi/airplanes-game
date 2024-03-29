import * as THREE from 'three';
import { ObserverState } from './observer/types';
import { NotesState } from './common/notes';
import { ServerTimeState } from './common/serverTime';
import { HealPointsState } from './game/actions/healPoints';
import { KeyboardState } from './common/keyboard';

export interface BodyStep {
  time: number;
  position: number[];
  rotation: number[];
  lastShotTime: number;
}

export interface Hit {
  bodyId: number;
}

export type AnimationType = 'shoot' | 'fireflash';
export type AnimationRepeatType = 'always' | number;

export interface AnimationPerFrame {
  frames: number;
  is_running: boolean;
  duration: number;
  cooldown: number;
  type: AnimationType;
  repeat: AnimationRepeatType;
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
  animation: AnimationPerFrame;
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

  serverEndTime: number;
  restartTime: number;

  visibility: VisibilityState;

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

  bodies: Map<number, BodyState>;

  healPoints: HealPointsState;

  serverTime: ServerTimeState;
  keyboard: KeyboardState;

  notes: NotesState;

  stick: StickState;

  damageIndicator: DamageIndicatorState;
}

export type JoinGameType = 'player' | 'observer' | 'bot';

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
    type: JoinGameType;
  };
  query: { [key: string]: string | boolean };
}
