import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { Airplane } from '../types';
import { Cmd } from '../commands';

interface BodyState {
  position: number[];
  velocity: number;
  velocityDirection: number[];
  rotation: number[];
}

export const updatePlayerBodyState = (airplane: Airplane, bodyState: BodyState): Cmd => {
  airplane.updateTime = Date.now();

  vec3.copy(airplane.position, bodyState.position);
  vec3.copy(airplane.velocityDirection, bodyState.velocityDirection);
  airplane.velocity = bodyState.velocity;
  quat.copy(airplane.rotation, bodyState.rotation);
};
