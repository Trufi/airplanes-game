import * as vec3 from '@2gis/gl-matrix/vec3';
import * as quat from '@2gis/gl-matrix/quat';
import { degToRad, clamp, localAxisToXYAngle, projection } from '../../utils';
import * as config from '../../../config';
import { PhysicBodyState, State } from '../../types';

const rotationAcceleration = { x: 0.000001, z: 0.000002 };
const maxRotationSpeed = { x: 0.001, z: 0.0005 };
const restoreYSpeed = 0.0006;

const xAxis = [1, 0, 0];
const yAxis = [0, 1, 0];

export const processPressedkeys = (dt: number, state: State) => {
  const { pressedKeys, stick, body } = state;

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

  // Обрабатываем стик для мобилок
  if (stick.x !== 0) {
    yawPressed = true;
    yawRight(dt * stick.x, body);
  }

  if (stick.y !== 0) {
    pitchPressed = true;
    pitchUp(dt * stick.y, body);
  }

  // Обрабатываем восстановление положение
  if (!yawPressed) {
    restoreYawAcceleration(dt, body);
  }

  if (!pitchPressed) {
    restorePitchAcceleration(dt, body);
  }

  if (!rollPressed) {
    restoreRoll(dt, body);
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
const bodyForward = [0, 0, 0];
const toTarget = [0, 0, 0];

const fire = (state: State) => {
  const {
    body: { weapon, rotation, position },
    bodies,
  } = state;

  if (state.time - weapon.lastShotTime < config.weapon.cooldown) {
    return;
  }

  weapon.lastShotTime = state.time;

  vec3.transformQuat(bodyForward, forwardDirection, rotation);

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
      weapon.hits.push({ bodyId: targetBody.id });
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
