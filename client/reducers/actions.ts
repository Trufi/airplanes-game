import * as quat from '@2gis/gl-matrix/quat';
import { PhysicBodyState, State } from '../types';
import { quatToEuler } from '../utils';

export const processPressedkeys = (
  dt: number,
  state: State,
  pressedKeys: { [key: string]: boolean },
) => {
  if (state.session) {
    const body = state.session.body;

    let rollPressed = false;

    for (const code in pressedKeys) {
      if (!pressedKeys[code]) {
        continue;
      }

      switch (code) {
        case 'KeyA':
          rollLeft(dt, body);
          rollPressed = true;
          break;
        case 'KeyD':
          rollRight(dt, body);
          rollPressed = true;
          break;
      }
    }

    if (!rollPressed) {
      restoreRoll(dt, body);
    }
  }
};

const rollSpeed = 0.001;
const rollComebackSpeed = 0.0002;

const rollLeft = (dt: number, body: PhysicBodyState) => {
  quat.rotateY(body.rotation, body.rotation, -dt * rollSpeed);
};

const rollRight = (dt: number, body: PhysicBodyState) => {
  quat.rotateY(body.rotation, body.rotation, dt * rollSpeed);
};

const restoreRoll = (dt: number, body: PhysicBodyState) => {
  const euler = quatToEuler(body.rotation);
  const roll = euler.pitch;
  if (Math.abs(roll) < rollComebackSpeed * dt) {
    quat.identity(body.rotation);
    quat.rotateZ(body.rotation, body.rotation, euler.yaw);
  } else if (roll > 0) {
    quat.rotateY(body.rotation, body.rotation, -rollComebackSpeed * dt);
  } else if (roll < 0) {
    quat.rotateY(body.rotation, body.rotation, rollComebackSpeed * dt);
  }
};
