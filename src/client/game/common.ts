import { State, PlayerState, NonPhysicBodyState, PhysicBodyState, BodyState } from '../types';
import { PlayerData, TickBodyData } from '../../server/messages';
import { createMesh, createShotMesh, createBulletMesh } from './view';

export const createPlayer = ({ id, name, bodyId, live }: PlayerData): PlayerState => ({
  id,
  bodyId,
  name,
  live,
});

export const addBody = (state: State, body: BodyState) => {
  state.bodies.set(body.id, body);
  body.mesh.add(body.shotMesh);
  body.mesh.add(body.weapon.left);
  body.mesh.add(body.weapon.right);
  state.scene.add(body.mesh);
};

export const createPhysicBody = (data: TickBodyData): PhysicBodyState => {
  const { id, position, velocityDirection, velocity, rotation, health } = data;
  const {mesh, mixer} = createMesh();
  return {
    type: 'physic',
    id,
    position,
    velocity,
    velocityDirection,
    rotation,
    health,
    mesh: mesh,
    animation: mixer,
    shotMesh: createShotMesh(),
    weapon: {
      lastShotTime: 0,
      hits: [],
      left: createBulletMesh(1),
      right: createBulletMesh(-1),
    },
  };
};

export const createNonPhysicBody = (data: TickBodyData): NonPhysicBodyState => {
  const { id, position, velocityDirection, velocity, rotation, health } = data;
  const {mesh, mixer} = createMesh();
  return {
    type: 'nonPhysic',
    id,
    position,
    velocity,
    velocityDirection,
    rotation,
    health,
    steps: [],
    mesh: mesh,
    animation: mixer,
    shotMesh: createShotMesh(),
    weapon: {
      lastShotTime: 0,
      left: createBulletMesh(1),
      right: createBulletMesh(-1),
    },
  };
};
