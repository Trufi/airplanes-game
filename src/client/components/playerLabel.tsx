import * as React from 'react';
import * as THREE from 'three';
import * as vec3 from '@2gis/gl-matrix/vec3';
import { unnormalizeMouse } from '../utils';
import { CameraState } from '../types';
import * as config from '../../config';

interface Props {
  name: string;
  position: number[];
  camera: CameraState;
  health: number;
  frustum: THREE.Frustum;
}

const v = new THREE.Vector3();

export const PlayerLabel = ({ name, position, camera, health, frustum }: Props) => {
  v.fromArray(position);

  if (!frustum.containsPoint(v)) {
    return null;
  }

  const distance = vec3.distance(position, camera.position);
  const color = distance < config.weapon.distance ? '#ff0000' : '#777777';

  v.project(camera.object);

  unnormalizeMouse(v, [window.innerWidth, window.innerHeight]);

  const width = 100;

  const x = Math.round(v.x - width / 2);
  const y = Math.round(v.y) - 40;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${width}px`,
        transform: `translate3d(${x}px,${y}px,0)`,
        color,
        textAlign: 'center',
      }}
    >
      {name}
      <br />
      {Math.round(health)} / 100
    </div>
  );
};
