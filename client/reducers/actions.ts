import * as quat from '@2gis/gl-matrix/quat';
import { PhysicBodyState, State } from '../types';

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
// const rollComebackSpeed = 0.0002;

const rollLeft = (dt: number, body: PhysicBodyState) => {
  quat.rotateY(body.rotation, body.rotation, -dt * rollSpeed);
};

const rollRight = (dt: number, body: PhysicBodyState) => {
  quat.rotateY(body.rotation, body.rotation, dt * rollSpeed);
};

const restoreRoll = (_dt: number, _body: PhysicBodyState) => {
  // if (Math.abs(this.roll) < rollComebackSpeed * dt) {
  //   this.roll = 0;
  // } else if (this.roll > 0) {
  //   this.roll = Math.max(0, this.roll - rollComebackSpeed * dt);
  // } else if (this.roll < 0) {
  //   this.roll = Math.min(0, this.roll + rollComebackSpeed * dt);
  // }
};
