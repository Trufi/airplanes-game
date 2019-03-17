import * as quat from '@2gis/gl-matrix/quat';
import * as vec3 from '@2gis/gl-matrix/vec3';
import { State, NonPhysicBodyState, BodyStep, PhysicBodyState } from '../../types';
import * as view from '../view';
import * as config from '../../../config';
import { degToRad } from '../../utils';
import { hideOldNotes } from '../../common/notes';
import { processPressedkeys } from './keys';
import { updateWeaponAnimation } from './weapon';

export const tick = (state: State, time: number) => {
  state.prevTime = state.time;
  state.time = time;

  processPressedkeys(state);

  state.bodies.forEach((body) => updateBody(state, body));

  updateCamera(state);
  hideOldNotes(state.notes, time);

  view.updateCameraAndMap(state);
};

const updateBody = (state: State, body: PhysicBodyState | NonPhysicBodyState) => {
  switch (body.type) {
    case 'physic':
      return updatePhysicBody(state, body);
    case 'nonPhysic':
      return updateNonPhysicBody(body, state.time, state.serverTime.diff);
  }
};

export const updateNonPhysicBody = (body: NonPhysicBodyState, time: number, timeDiff: number) => {
  // 300ms - порог, чтобы точно данные дошли
  const interpolationTime = time - timeDiff - 300;

  const startIndex = findStepInterval(interpolationTime, body.steps);
  if (startIndex === -1) {
    return;
  }
  const startStep = body.steps[startIndex];
  const endStep = body.steps[startIndex + 1];

  // С сервера всегда приходит последний стейт, поэтому они могут повторятся,
  // если у другого игрока зависла игра
  if (startStep.time - endStep.time === 0) {
    return;
  }

  // Чистим массив от старых steps
  body.steps.splice(0, startIndex);
  const t = (interpolationTime - startStep.time) / (endStep.time - startStep.time);

  vec3.lerp(body.position, startStep.position, endStep.position, t);
  quat.slerp(body.rotation, startStep.rotation, endStep.rotation, t);

  body.weapon.lastShotTime = endStep.weapon.lastShotTime;
  updateWeaponAnimation(body.weapon, interpolationTime);

  body.health = endStep.health;

  view.updateNonPhysicMesh(body);
  view.updateBullet(body.weapon.left, body);
  view.updateBullet(body.weapon.right, body);
};

/**
 * Возвращает индекс стартового элемента в steps
 * Конечный элемент будет i + 1
 */
const findStepInterval = (time: number, steps: BodyStep[]): number => {
  // Считаем, что массив отсортирован по возрастанию time
  for (let i = steps.length - 2; i >= 0; i--) {
    const step = steps[i];
    if (step.time <= time) {
      return i;
    }
  }
  return -1;
};

const velocityVector = [0, 0, 0];
const rotation = [0, 0, 0, 1];

const updatePhysicBody = (state: State, body: PhysicBodyState) => {
  const dt = state.time - state.prevTime;

  quat.identity(rotation);
  quat.rotateX(rotation, rotation, body.velocityDirection[0] * dt);
  quat.rotateY(rotation, rotation, body.velocityDirection[1] * dt);
  quat.rotateZ(rotation, rotation, body.velocityDirection[2] * dt);

  quat.mul(body.rotation, body.rotation, rotation);
  vec3.set(velocityVector, 0, body.velocity, 0);
  vec3.transformQuat(velocityVector, velocityVector, body.rotation);

  body.position[0] += velocityVector[0] * dt;
  body.position[1] += velocityVector[1] * dt;
  body.position[2] = Math.max(body.position[2] + velocityVector[2] * dt, config.minimalHeight);

  updateWeaponAnimation(body.weapon, state.time);

  view.updatePhysicMesh(body);
  view.updateBullet(body.weapon.left, body);
  view.updateBullet(body.weapon.right, body);
};

const updateCamera = (state: State) => {
  const { body, camera } = state;

  if (!body) {
    return;
  }

  // Наклоняем камеру
  quat.rotateX(camera.rotation, body.rotation, degToRad(config.camera.pitch));

  // Отодвигаем камеру от самолета
  const shift = [0, 4500, 15000];
  vec3.transformQuat(shift, shift, camera.rotation);
  vec3.add(camera.position, body.position, shift);
};
