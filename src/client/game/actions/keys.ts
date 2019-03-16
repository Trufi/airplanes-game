import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { degToRad, projection, restoreRoll } from '../../utils';
import * as config from '../../../config';
import { PhysicBodyState, State } from '../../types';
import { clamp } from '../../../utils';
import { Vector3 } from 'three';

const rotationAcceleration = { x: 0.000004, z: 0.000004 };
const maxRotationSpeed = { x: 0.0007, z: 0.0007 };
const restoreYSpeed = 0.0006;

export const processPressedkeys = (dt: number, state: State) => {
  const { pressedKeys, stick, body } = state;

  if (!body) {
    return;
  }

  let yawPressed = false;
  let pitchPressed = false;
  let rollPressed = false;

  for (const code in pressedKeys) {
    if (!pressedKeys[code]) {
      continue;
    }

    switch (code) {
      case 'KeyA':
        yawLeft(dt / 2, body);
        yawPressed = true;
        break;
      case 'KeyD':
        yawRight(dt / 2, body);
        yawPressed = true;
        break;
      case 'KeyW':
        pitchDown(dt / 2, body);
        pitchPressed = true;
        break;
      case 'KeyS':
        pitchUp(dt / 2, body);
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

  // Обрабатываем стик для мобилок
  if (stick.x !== 0) {
    yawPressed = true;
    processStickX(stick, body, dt);
  }

  if (stick.y !== 0) {
    pitchPressed = true;
    processStickY(stick, body, dt);
  }

  // Обрабатываем восстановление положение
  if (!yawPressed) {
    restoreYawAcceleration(dt, body);
  }

  if (!pitchPressed) {
    restorePitchAcceleration(dt, body);
  }

  if (!rollPressed) {
    restoreRoll(body.rotation, dt, restoreYSpeed, 40);
  }
};

const processStickX = (stick: State['stick'], body: PhysicBodyState, dt: number) => {
  const targetRotSpeedX = -maxRotationSpeed.z * stick.x;
  const currentRotSpeedX = body.velocityDirection[2];

  const deltaRotSpeedX =
    Math.sign(targetRotSpeedX - currentRotSpeedX) * rotationAcceleration.z * dt;

  if (Math.abs(targetRotSpeedX - currentRotSpeedX) < Math.abs(deltaRotSpeedX)) {
    body.velocityDirection[2] = clamp(targetRotSpeedX, -maxRotationSpeed.z, maxRotationSpeed.z);
  } else {
    body.velocityDirection[2] = clamp(
      currentRotSpeedX + deltaRotSpeedX,
      -maxRotationSpeed.z,
      maxRotationSpeed.z,
    );
  }
};

const processStickY = (stick: State['stick'], body: PhysicBodyState, dt: number) => {
  const targetRotSpeedY = maxRotationSpeed.x * stick.y;
  const currentRotSpeedY = body.velocityDirection[0];

  const deltaRotSpeedY =
    Math.sign(targetRotSpeedY - currentRotSpeedY) * rotationAcceleration.x * dt;

  if (Math.abs(targetRotSpeedY - currentRotSpeedY) < Math.abs(deltaRotSpeedY)) {
    body.velocityDirection[0] = clamp(targetRotSpeedY, -maxRotationSpeed.x, maxRotationSpeed.x);
  } else {
    body.velocityDirection[0] = clamp(
      currentRotSpeedY + deltaRotSpeedY,
      -maxRotationSpeed.x,
      maxRotationSpeed.x,
    );
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

const forwardDirection = [0, 1, 0];
const bodyForward = [0, 0, 0];
const toTarget = [0, 0, 0];
const bodyRotation = [0, 0, 0, 1];

const fire = (state: State) => {
  const { body } = state;
  if (!body) {
    return;
  }

  const {
    bodies,
    camera: { rotation, position },
  } = state;

  const { weapon } = body;

  if (state.time - weapon.lastShotTime < config.weapon.cooldown) {
    return;
  }

  weapon.lastShotTime = state.time;

  quat.rotateX(bodyRotation, rotation, -degToRad(config.camera.pitch));
  vec3.transformQuat(bodyForward, forwardDirection, bodyRotation);

  for (const [, targetBody] of bodies) {
    vec3.sub(toTarget, targetBody.position, position);

    const targetProjection = projection(toTarget, bodyForward);
    const angle = hitAngle(toTarget, bodyForward, config.weapon.radius);

    if (
      // Если проекция на направление больше 0, то цель находится впереди
      targetProjection > 0 &&
      vec3.len(toTarget) < config.weapon.distance &&
      angle < degToRad(config.weapon.hitAngle)
    ) {
      weapon.lastHitTime = state.time;
      weapon.hits.push({ bodyId: targetBody.id });
      weapon.target = new Vector3(
        targetBody.position[0],
        targetBody.position[1],
        targetBody.position[2],
      );
    }
  }
};

const hitAngle = (target: number[], forward: number[], radius: number) => {
  /**
   *              _ /|
   *          _ / _/ |
   *      _ /   _/   | X  α — угл между направлением тела вперед (forward) и целью (target)
   *    /_β____/_____|    R — меньший ралиус конуса
   *   |    _/       |    P — проекция вектора D на направление самолета
   * R | __/         | R  β — угл, который нам надо найти, чтобы понять, что есть попадание
   *   |/_α__________|
   *          P
   * tg α = (X + R) / P  ⇒  X = P * tg α - R
   * tg β = X / P = tg α - R / P
   */

  const alpha = vec3.angle(target, forward);
  const p = projection(target, forward);
  const tanBeta = Math.tan(alpha) - radius / p;
  return Math.atan(tanBeta);
};
