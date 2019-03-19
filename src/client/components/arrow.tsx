import * as React from 'react';
import * as THREE from 'three';
import * as vec2 from '@2gis/gl-matrix/vec2';
import * as vec3 from '@2gis/gl-matrix/vec3';
import { CameraState } from '../types';
import * as config from '../../config';

interface Props {
  position: number[];
  camera: CameraState;
  frustum: THREE.Frustum;
}

const v = new THREE.Vector3();
const t = [0, 0];

export const Arrow = ({ position, camera, frustum }: Props) => {
  v.fromArray(position);

  if (frustum.containsPoint(v)) {
    return null;
  }

  const distance = vec3.distance(position, camera.position);
  const near = distance < config.weapon.distance;

  v.project(camera.object);

  if (v.z < 1) {
    vec2.set(t, v.x, -v.y);
  } else {
    vec2.set(t, -v.x, v.y);
  }
  vec2.normalize(t, t);

  const angle = Math.atan2(t[1], t[0]) + Math.PI / 2;

  const width = 6;
  const height = 16;

  const minSize = Math.min(window.innerHeight, window.innerWidth);
  const radius = minSize * 0.2;
  const x = Math.round(t[0] * radius - width / 2);
  const y = Math.round(t[1] * radius - height / 2);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate3d(${x}px,${y}px,0) rotateZ(${angle}rad)`,
        width: 0,
        height: 0,
        borderLeft: `${width / 2}px solid transparent`,
        borderRight: `${width / 2}px solid transparent`,
        borderBottom: `${height}px solid ${
          near ? 'rgba(255, 0, 0, 0.5)' : 'rgba(128, 128, 128, 0.3)'
        }`,
        zIndex: near ? 1 : 0,
      }}
    />
  );
};
