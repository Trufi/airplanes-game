import { State, PlayerState, NonPhysicBodyState, PhysicBodyState } from '../types';
import { PlayerData, TickBodyData } from '../../server/messages';
import { createMesh, createShotMesh } from './view';

export const createPlayer = (state: State, { id, name, bodyId, live }: PlayerData) => {
  const player: PlayerState = {
    id,
    bodyId,
    name,
    live,
  };
  state.players.set(player.id, player);
};

export const createPhysicBody = (state: State, data: TickBodyData) => {
  const { id, position, velocityDirection, velocity, rotation, health } = data;
  const body: PhysicBodyState = {
    type: 'physic',
    id,
    position,
    velocity,
    velocityDirection,
    rotation,
    health,
    mesh: createMesh(),
    shotMesh: createShotMesh(),
    weapon: {
      lastShotTime: 0,
      hits: [],
    },
  };
  state.bodies.set(id, body);

  body.mesh.add(body.shotMesh);
  state.scene.add(body.mesh);
};

export const createNonPhysicBody = (state: State, data: TickBodyData) => {
  const { id, position, velocityDirection, velocity, rotation, health } = data;
  const body: NonPhysicBodyState = {
    type: 'nonPhysic',
    id,
    position,
    velocity,
    velocityDirection,
    rotation,
    health,
    steps: [],
    mesh: createMesh(),
    shotMesh: createShotMesh(),
    weapon: {
      lastShotTime: 0,
    },
  };
  state.bodies.set(id, body);

  body.mesh.add(body.shotMesh);
  state.scene.add(body.mesh);
};
