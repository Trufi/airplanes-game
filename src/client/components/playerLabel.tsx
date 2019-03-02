import * as React from 'react';
import * as THREE from 'three';
import { unnormalizeMouse } from '../utils';

interface Props {
  name: string;
  position: number[];
  camera: THREE.PerspectiveCamera;
  health: number;
  frustum: THREE.Frustum;
}

const v = new THREE.Vector3();

export const PlayerLabel = ({ name, position, camera, health, frustum }: Props) => {
  v.fromArray(position);

  if (!frustum.containsPoint(v)) {
    return null;
  }

  v.project(camera);

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
        color: '#ff0000',
        textAlign: 'center',
      }}
    >
      {name}
      <br />
      {Math.round(health)} / 100
    </div>
  );
};
