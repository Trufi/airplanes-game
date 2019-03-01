import * as React from 'react';
import * as THREE from 'three';
import { unnormalizeMouse } from '../utils';
import * as config from '../../config';

interface Props {
  position: number[];
  rotation: number[];
  camera: THREE.PerspectiveCamera;
}

const v = new THREE.Vector3();
const offset = new THREE.Vector3();
const r = new THREE.Quaternion();

export const Aim = ({ position, rotation, camera }: Props) => {
  v.fromArray(position);

  offset.set(0, config.weapon.distance, 0);
  r.fromArray(rotation);
  offset.applyQuaternion(r);
  v.add(offset);

  v.project(camera);
  unnormalizeMouse(v, [window.innerWidth, window.innerHeight]);

  const width = 50;
  const x = Math.round(v.x - width / 2);
  const y = Math.round(v.y - width / 2);

  return (
    <img
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
      }}
      src='./assets/aim.png'
    />
  );
};
