import * as quat from '@2gis/gl-matrix/quat';
import * as vec3 from '@2gis/gl-matrix/vec3';
import { State, NonPhysicBodyState, BodyStep, PhysicBodyState } from '../../types';
import { updateMesh, updateBullet, updateCameraAndMap } from '../view';
import { lerp } from '../../../utils';
import * as config from '../../../config';

export const tick = (state: State, time: number) => {
  state.prevTime = state.time;
  state.time = time;

  state.bodies.forEach((body) => updateBody(state, body));

  if (state.body) {
    updateCameraAndMap(state, state.body);
  }

  hideOldDeathNotes(state);
};

const updateBody = (state: State, body: PhysicBodyState | NonPhysicBodyState) => {
  switch (body.type) {
    case 'physic':
      return updatePhysicBody(state, body);
    case 'nonPhysic':
      return updateNonPhysicBody(body, state.time, state.serverTime.diff);
  }
};

const updateNonPhysicBody = (body: NonPhysicBodyState, time: number, timeDiff: number) => {
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
  vec3.lerp(body.velocityDirection, startStep.velocityDirection, endStep.velocityDirection, t);

  body.weapon.lastShotTime = lerp(startStep.weapon.lastShotTime, endStep.weapon.lastShotTime, t);

  body.health = endStep.health;

  updateMesh(body);
  updateBullet(interpolationTime, body.weapon.left, body.weapon);
  updateBullet(interpolationTime, body.weapon.right, body.weapon);
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

  updateMesh(body);
  updateBullet(state.time, body.weapon.left, body.weapon);
  updateBullet(state.time, body.weapon.right, body.weapon);
};

const hideOldDeathNotes = (state: State) => {
  state.deathNotes = state.deathNotes.filter(
    (note) => state.time - note.time < config.deathNote.delay,
  );
};
