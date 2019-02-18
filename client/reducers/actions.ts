import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { PhysicBodyState, State } from '../types';
import { degToRad, clamp } from '../utils';
import * as config from '../../config';

const rotationAcceleration = { x: 0.000001, z: 0.000002 };
const maxRotationSpeed = { x: 0.001, z: 0.002 };

const globalZ = [0, 0, 1];
const localZ = [0, 0, 1];
const alignmentRotation = [0, 0, 0, 1];

export const processPressedkeys = (dt: number, state: State) => {
  if (state.session) {
    const {
      session: { body },
      pressedKeys,
    } = state;

    let yawPressed = false;
    let pitchPressed = false;

    for (const code in pressedKeys) {
      if (!pressedKeys[code]) {
        continue;
      }

      switch (code) {
        case 'KeyA':
          yawLeft(dt, body);
          yawPressed = true;
          break;
        case 'KeyD':
          yawRight(dt, body);
          yawPressed = true;
          break;
        case 'KeyW':
          pitchDown(dt, body);
          pitchPressed = true;
          break;
        case 'KeyS':
          pitchUp(dt, body);
          pitchPressed = true;
          break;
        case 'Space':
          fire(state);
          break;
      }
    }

    if (!yawPressed) {
      restoreYaw(dt, body);
    }

    if (!pitchPressed) {
      restorePitch(dt, body);
    }

    // Выравниваем самолет
    vec3.transformQuat(localZ, globalZ, body.rotation);
    quat.rotationTo(alignmentRotation, localZ, globalZ);

    quat.mul(alignmentRotation, alignmentRotation, body.rotation);
    quat.slerp(body.rotation, body.rotation, alignmentRotation, 0.0005 * dt);
  }
};

const yawLeft = (dt: number, body: PhysicBodyState) => {
  body.velocityDirection[2] = clamp(
    body.velocityDirection[2] + rotationAcceleration.z * dt,
    -maxRotationSpeed.z,
    maxRotationSpeed.z,
  );
};

const yawRight = (dt: number, body: PhysicBodyState) => {
  body.velocityDirection[2] = clamp(
    body.velocityDirection[2] - rotationAcceleration.z * dt,
    -maxRotationSpeed.z,
    maxRotationSpeed.z,
  );
};

const restoreYaw = (dt: number, body: PhysicBodyState) => {
  if (Math.abs(body.velocityDirection[2]) < rotationAcceleration.z * dt) {
    body.velocityDirection[2] = 0;
  } else if (body.velocityDirection[2] > 0) {
    yawRight(dt, body);
  } else {
    yawLeft(dt, body);
  }
};

const pitchDown = (dt: number, body: PhysicBodyState) => {
  body.velocityDirection[0] = clamp(
    body.velocityDirection[0] - rotationAcceleration.x * dt,
    -maxRotationSpeed.x,
    maxRotationSpeed.x,
  );
};

const pitchUp = (dt: number, body: PhysicBodyState) => {
  body.velocityDirection[0] = clamp(
    body.velocityDirection[0] + rotationAcceleration.x * dt,
    -maxRotationSpeed.x,
    maxRotationSpeed.x,
  );
};

const restorePitch = (dt: number, body: PhysicBodyState) => {
  if (Math.abs(body.velocityDirection[0]) < rotationAcceleration.x * dt) {
    body.velocityDirection[0] = 0;
  } else if (body.velocityDirection[0] > 0) {
    pitchDown(dt, body);
  } else {
    pitchUp(dt, body);
  }
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
    session: {
      body: { weapon, rotation, position },
    },
  } = state;

  if (state.time - weapon.lastShotTime < config.weapon.delay) {
    return;
  }

  weapon.lastShotTime = state.time;

  vec3.transformQuat(bodyDirection, forwardDirection, rotation);

  for (const [, otherBody] of bodies) {
    vec3.sub(toOtherDirection, otherBody.position, position);
    const angle = vec3.angle(bodyDirection, toOtherDirection);

    if (
      angle < degToRad(config.weapon.hitAngle) &&
      vec3.dist(position, otherBody.position) < config.weapon.distance
    ) {
      weapon.hits.push({ bodyId: otherBody.id });
    }
  }
};
