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
  /**
   * THREE.Mesh
   */
  mesh: any;
  shotMesh: any;
  position: number[];
  velocity: number;
  rotation: number[];
  velocityDirection: number[];
  weapon: WeaponState;
}

export interface NonPhysicBodyState {
  id: number;
  playerId: number;

  /**
   * THREE.Mesh
   */
  mesh: any;
  shotMesh: any;
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
}

export interface SessionState {
  id: number;
  body: PhysicBodyState;
}

export interface ServerTimeState {
  diff: number;
  ping: number;
}

export interface State {
  time: number;
  prevTime: number;
  session?: SessionState;
  players: Map<number, PlayerState>;

  /**
   * THREE.Scene
   */
  scene: any;
  bodies: Map<number, NonPhysicBodyState>;
  serverTime: ServerTimeState;
}
