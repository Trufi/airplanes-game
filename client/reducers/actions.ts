import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { PhysicBodyState, State } from '../types';
import { degToRad } from '../utils';
import * as config from '../../config';

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
        case 'KeyW':
          pitchDown(dt, body);
          break;
        case 'KeyS':
          pitchUp(dt, body);
          break;
        case 'Space':
          fire(state);
          break;
      }
    }

    if (!rollPressed) {
      restoreRoll(dt, body);
    }
  }
};

const rollSpeed = 0.001;

const rollLeft = (dt: number, body: PhysicBodyState) => {
  quat.rotateY(body.rotation, body.rotation, -dt * rollSpeed);
};

const rollRight = (dt: number, body: PhysicBodyState) => {
  quat.rotateY(body.rotation, body.rotation, dt * rollSpeed);
};

const restoreRoll = (_dt: number, _body: PhysicBodyState) => {
  // const euler = quatToEuler(body.rotation);
  // const roll = euler.pitch;
  // if (Math.abs(roll) < rollComebackSpeed * dt) {
  //   quat.identity(body.rotation);
  //   quat.rotateZ(body.rotation, body.rotation, euler.yaw);
  // } else if (roll > 0) {
  //   quat.rotateY(body.rotation, body.rotation, -rollComebackSpeed * dt);
  // } else if (roll < 0) {
  //   quat.rotateY(body.rotation, body.rotation, rollComebackSpeed * dt);
  // }
};

const pitchDown = (dt: number, body: PhysicBodyState) => {
  quat.rotateX(body.rotation, body.rotation, -dt * rollSpeed);
};

const pitchUp = (dt: number, body: PhysicBodyState) => {
  quat.rotateX(body.rotation, body.rotation, dt * rollSpeed);
};

const forwardDirection = [0, 1, 0];
const bodyDirection = [0, 0, 0];
const toOtherDirection = [0, 0, 0];

export const fire = (state: State) => {
  if (!state.session) {
    return;
  }
  const {
    bodies,
    session: { body },
    weapon,
  } = state;

  if (state.time - weapon.lastShotTime < config.weapon.delay) {
    return;
  }

  weapon.lastShotTime = state.time;

  vec3.transformQuat(bodyDirection, forwardDirection, body.rotation);

  for (const [, otherBody] of bodies) {
    vec3.sub(toOtherDirection, otherBody.position, body.position);
    const angle = vec3.angle(bodyDirection, toOtherDirection);

    if (
      angle < degToRad(config.weapon.hitAngle) &&
      vec3.dist(body.position, otherBody.position) < config.weapon.distance
    ) {
      weapon.hits.push({ bodyId: otherBody.id });
    }
  }
};
