import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { degToRad, clamp, localAxisToXYAngle } from '../utils';
import * as config from '../../config';
import { PhysicBodyState, State } from '../types';

const rotationAcceleration = { x: 0.000001, z: 0.000002 };
const maxRotationSpeed = { x: 0.001, z: 0.002 };
const restoreYSpeed = 0.0006;

const xAxis = [1, 0, 0];
const yAxis = [0, 1, 0];

export const processPressedkeys = (dt: number, state: State) => {
  if (state.session) {
    const {
      session: { body },
      pressedKeys,
    } = state;

    let yawPressed = false;
    let pitchPressed = false;
    let rollPressed = false;

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
        case 'KeyE':
          quat.rotateY(body.rotation, body.rotation, 0.001 * dt);
          rollPressed = true;
          break;
        case 'KeyQ':
          quat.rotateY(body.rotation, body.rotation, -0.001 * dt);
          rollPressed = true;
          break;
        case 'Space':
          fire(state);
          break;
      }
    }

    if (!yawPressed) {
      restoreYawAcceleration(dt, body);
    }

    if (!pitchPressed) {
      restorePitchAcceleration(dt, body);
    }

    if (!rollPressed) {
      restoreRoll(dt, body);
    }
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

const restoreYawAcceleration = (dt: number, body: PhysicBodyState) => {
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

const restorePitchAcceleration = (dt: number, body: PhysicBodyState) => {
  if (Math.abs(body.velocityDirection[0]) < rotationAcceleration.x * dt) {
    body.velocityDirection[0] = 0;
  } else if (body.velocityDirection[0] > 0) {
    pitchDown(dt, body);
  } else {
    pitchUp(dt, body);
  }
};

const restoreRoll = (dt: number, body: PhysicBodyState) => {
  const angleY = localAxisToXYAngle(yAxis, body.rotation);

  // TODO: надо обойти кейс, когда X локальный перпендикулярен глобальному
  // в этом случае горизонт остается перпендикулярным

  // Восстанавливаем горизонт, только если прицел смотрит почти на него
  if (Math.abs(angleY) < degToRad(25)) {
    const angleX = localAxisToXYAngle(xAxis, body.rotation);
    const rotationYAngle = restoreYSpeed * dt;

    if (rotationYAngle > Math.abs(angleX)) {
      quat.rotateY(body.rotation, body.rotation, angleX);
    } else {
      quat.rotateY(body.rotation, body.rotation, Math.sign(angleX) * rotationYAngle);
    }
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
