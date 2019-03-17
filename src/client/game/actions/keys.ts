import * as quat from '@2gis/gl-matrix/quat';
import { PhysicBodyState, State } from '../../types';
import { clamp } from '../../../utils';
import { updateBoost } from './boost';
import { localAxisToXYAngle, degToRad } from '../../utils';
import { updateWeapon } from './weapon';

const rotationAcceleration = { x: 0.000004, z: 0.000004 };
const maxRotationSpeed = { x: 0.0007, z: 0.0007 };
const restoreYSpeed = 0.0006;

export const processPressedkeys = (state: State) => {
  const { pressedKeys, stick, body } = state;
  const dt = state.time - state.prevTime;

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
    }
  }

  updateWeapon(state, pressedKeys['Space']);
  updateBoost(body, dt, pressedKeys['KeyF']);

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

const setVelocityDirectionX = (body: PhysicBodyState, x: number) => {
  body.velocityDirection[0] = clamp(x, -maxRotationSpeed.x, maxRotationSpeed.x);
};

const setVelocityDirectionZ = (body: PhysicBodyState, x: number) => {
  body.velocityDirection[2] = clamp(x, -maxRotationSpeed.z, maxRotationSpeed.z);
};

const processStickX = (stick: State['stick'], body: PhysicBodyState, dt: number) => {
  const targetRotSpeedX = -maxRotationSpeed.z * stick.x;
  const currentRotSpeedX = body.velocityDirection[2];

  const deltaRotSpeedX =
    Math.sign(targetRotSpeedX - currentRotSpeedX) * rotationAcceleration.z * dt;

  if (Math.abs(targetRotSpeedX - currentRotSpeedX) < Math.abs(deltaRotSpeedX)) {
    setVelocityDirectionZ(body, targetRotSpeedX);
  } else {
    setVelocityDirectionZ(body, currentRotSpeedX + deltaRotSpeedX);
  }
};

const processStickY = (stick: State['stick'], body: PhysicBodyState, dt: number) => {
  const targetRotSpeedY = maxRotationSpeed.x * stick.y;
  const currentRotSpeedY = body.velocityDirection[0];

  const deltaRotSpeedY =
    Math.sign(targetRotSpeedY - currentRotSpeedY) * rotationAcceleration.x * dt;

  if (Math.abs(targetRotSpeedY - currentRotSpeedY) < Math.abs(deltaRotSpeedY)) {
    setVelocityDirectionX(body, targetRotSpeedY);
  } else {
    setVelocityDirectionX(body, currentRotSpeedY + deltaRotSpeedY);
  }
};

const yawLeft = (dt: number, body: PhysicBodyState) => {
  setVelocityDirectionZ(body, body.velocityDirection[2] + rotationAcceleration.z * dt);
};

const yawRight = (dt: number, body: PhysicBodyState) => {
  setVelocityDirectionZ(body, body.velocityDirection[2] - rotationAcceleration.z * dt);
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
  setVelocityDirectionX(body, body.velocityDirection[0] - rotationAcceleration.x * dt);
};

const pitchUp = (dt: number, body: PhysicBodyState) => {
  setVelocityDirectionX(body, body.velocityDirection[0] + rotationAcceleration.x * dt);
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

const xAxis = [1, 0, 0];
const yAxis = [0, 1, 0];
const restoreRoll = (
  rotation: number[],
  dt: number,
  restoreSpeed: number,
  thresholdDegress: number,
) => {
  const angleY = localAxisToXYAngle(yAxis, rotation);
  // TODO: надо обойти кейс, когда X локальный перпендикулярен глобальному
  // в этом случае горизонт остается перпендикулярным

  // Восстанавливаем горизонт, только если прицел смотрит почти на него
  if (Math.abs(angleY) < degToRad(thresholdDegress)) {
    const angleX = localAxisToXYAngle(xAxis, rotation);
    const rotationYAngle = restoreSpeed * dt;

    if (rotationYAngle > Math.abs(angleX)) {
      quat.rotateY(rotation, rotation, angleX);
    } else {
      quat.rotateY(rotation, rotation, Math.sign(angleX) * rotationYAngle);
    }
  }
};
