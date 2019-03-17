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
  const near = distance < config.weapon.distance;
  const color = near ? '#ff0000' : 'rgba(128, 128, 128, 0.3)';

  v.project(camera.object);

  unnormalizeMouse(v, [window.innerWidth, window.innerHeight]);

  const width = 100;

  const height = near ? 40 : 20;

  const x = Math.round(v.x - width / 2);
  const y = Math.round(v.y) - height;

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
        userSelect: 'none',
      }}
    >
      {name}
      {near && (
        <>
          <br />
          {Math.round(health)} / 100
        </>
      )}
    </div>
  );
};
