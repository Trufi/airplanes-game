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
}

export interface PhysicBodyState {
  mesh: THREE.Object3D;
  shotMesh: THREE.Object3D;
  position: number[];
  velocity: number;
  rotation: number[];
  velocityDirection: number[];
  weapon: WeaponState;
}

export interface NonPhysicBodyState {
  id: number;
  playerId: number;
  mesh: THREE.Object3D;
  shotMesh: THREE.Object3D;
  position: number[];
  rotation: number[];
  velocityDirection: number[];
  health: number;
  weapon: {
    lastShotTime: number;
  };
  steps: BodyStep[];
}

export interface PlayerState {
  id: number;
  bodyId: number;
  name: string;
  live: boolean;
}

export interface GameState {
  id: number;
  body: PhysicBodyState;
  name: string;
  live: boolean;
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
  // TODO: Разбить стейты на несколько состояний и возможно вынести в redux
  id?: number;
  name?: string;
  gameList?: Array<{ id: number }>;

  time: number;
  prevTime: number;

  /**
   * Начало системы отсчета.
   * Нужен для того, чтобы глобальные координаты не выходили за int32 (максимум точности в шейдерах)
   */
  origin: number[];

  game?: GameState;
  players: Map<number, PlayerState>;

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  map: J.Map;
  bodies: Map<number, NonPhysicBodyState>;
  serverTime: ServerTimeState;
  pressedKeys: { [key: string]: boolean };

  deathNotes: DeathNote[];

  stick: StickState;
}
