import * as vec2 from '@2gis/gl-matrix/vec2';
import * as vec3 from '@2gis/gl-matrix/vec3';
import * as THREE from 'three';
import { HealPointData, ServerMsg } from '../../../gameServer/messages';
import { createHealPointMesh, updateHealPointMesh } from '../view';
import { Cmd, cmd } from '../../commands';
import { State } from '../../types';
import { ObserverState } from '../../observer/types';
import * as config from '../../../config';
import { msg } from '../../messages';

export interface HealPoint {
  id: number;
  position: number[];
  live: boolean;
  mesh: THREE.Mesh;
}

export interface HealPointsState {
  points: Map<number, HealPoint>;
}

export const createHealPointsState = (): HealPointsState => {
  const points = new Map<number, HealPoint>();

  return {
    points,
  };
};

export const setHealPointState = (state: State | ObserverState, data: HealPointData[]) => {
  const {
    healPoints: { points },
    scene,
    origin,
  } = state;

  // Удаляем предыдущие поинты
  points.forEach((healPoint) => {
    scene.remove(healPoint.mesh);
  });

  // Добавляем новые
  data.forEach(({ id, live, position }) => {
    const scenePosition = [0, 0, config.healPoints.height];
    vec2.sub(scenePosition, position, origin);

    const healPoint = {
      id,
      live,
      position: scenePosition,
      mesh: createHealPointMesh(scenePosition),
    };
    points.set(healPoint.id, healPoint);
    scene.add(healPoint.mesh);
  });
};

export const updateHealPoints = (state: State | ObserverState): Cmd => {
  const {
    healPoints: { points },
  } = state;

  points.forEach((hl) => updateHealPointMesh(hl));

  if (state.type === 'game' && state.body) {
    for (const [, healPoint] of points) {
      if (healPoint.live && bodyInHealPoint(state.body.position, healPoint.position)) {
        healPoint.live = false;
        return cmd.sendMsg(msg.takeHealPoint(healPoint.id, state.time, state.serverTime.diff));
      }
    }
  }
};

const bodyInHealPoint = (bodyPosition: number[], hpPosition: number[]) => {
  return vec3.distance(bodyPosition, hpPosition) < config.healPoints.radius;
};

export const healPointAlive = (state: HealPointsState, msg: ServerMsg['healPointAlive']) => {
  const point = state.points.get(msg.id);
  if (point) {
    point.live = true;
  }
};

export const healPointWasTaken = (state: HealPointsState, msg: ServerMsg['healPointWasTaken']) => {
  const point = state.points.get(msg.id);
  if (point) {
    point.live = false;
  }
};
