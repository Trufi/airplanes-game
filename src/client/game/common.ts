import { PlayerState, NonPhysicBodyState, PhysicBodyState, BodyState } from '../types';
import { PlayerData, TickBodyData } from '../../gameServer/messages';
import { createMesh, createShotMesh, createBulletMesh } from './view';
import { pick } from '../../utils';
import * as config from '../../config';
import { createBoostState } from './actions/boost';

export const createPlayer = (data: PlayerData): PlayerState =>
  pick(data, ['id', 'bodyId', 'name', 'live', 'kills', 'deaths', 'points']);

export const addBody = (
  state: {
    bodies: Map<number, BodyState>;
    scene: THREE.Scene;
  },
  body: BodyState,
) => {
  state.bodies.set(body.id, body);
  body.mesh.add(body.shotMesh);
  body.mesh.add(body.weapon.left);
  body.mesh.add(body.weapon.right);
  state.scene.add(body.mesh);
};

export const createPhysicBody = (data: TickBodyData): PhysicBodyState => {
  const { id, position, rotation, health } = data;
  const mesh = createMesh();
  return {
    type: 'physic',
    id,
    position,
    velocity: config.airplane.velocity,
    velocityDirection: [0, 0, 0],
    rotation,
    health,
    mesh,
    shotMesh: createShotMesh(),
    boost: createBoostState(),
    weapon: {
      heat: 0,
      blocked: false,
      lastHitTime: 0,
      lastShotTime: 0,
      animation: { is_running: false, frames: 0 },
      hits: [],
      left: createBulletMesh(1),
      right: createBulletMesh(-1),
    },
  };
};

export const createNonPhysicBody = (data: TickBodyData): NonPhysicBodyState => {
  const {
    id,
    position,
    rotation,
    health,
    updateTime,
    weapon: { lastShotTime },
  } = data;
  const mesh = createMesh();

  return {
    type: 'nonPhysic',
    id,
    position,
    velocity: config.airplane.velocity,
    rotation,
    health,
    steps: [
      {
        position,
        rotation,
        time: updateTime,
        lastShotTime,
      },
    ],
    mesh,
    shotMesh: createShotMesh(),
    weapon: {
      lastShotTime,
      animation: { is_running: false, frames: 0 },
      left: createBulletMesh(1),
      right: createBulletMesh(-1),
    },
  };
};
