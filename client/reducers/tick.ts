import * as quat from '@2gis/gl-matrix/quat';
import * as vec3 from '@2gis/gl-matrix/vec3';
import { State, NonPhysicBodyState, BodyStep } from '../types';
import { updateMesh, updateShot, updateCameraAndMap } from '../view';
import { lerp } from '../../server/utils';

export const tick = (state: State, time: number) => {
  state.prevTime = state.time;
  state.time = time;

  state.bodies.forEach((body) => updateNonPhysicBody(body, state.time));

  updatePhysicBody(state);

  updateCameraAndMap(state);
};

const updateNonPhysicBody = (body: NonPhysicBodyState, time: number) => {
  // TODO: вычислять пинг
  const ping = 300;

  const interpolationTime = time - ping;

  const startIndex = findStepInterval(interpolationTime, body.steps);
  if (startIndex === -1) {
    return;
  }
  const startStep = body.steps[startIndex];
  const endStep = body.steps[startIndex + 1];

  const t = (interpolationTime - startStep.time) / (endStep.time - startStep.time);

  vec3.lerp(body.position, startStep.position, endStep.position, t);
  quat.slerp(body.rotation, startStep.rotation, endStep.rotation, t);
  vec3.lerp(body.velocityDirection, startStep.velocityDirection, endStep.velocityDirection, t);

  body.weapon.lastShotTime = lerp(startStep.weapon.lastShotTime, endStep.weapon.lastShotTime, t);

  body.health = endStep.health;

  updateMesh(body);
  updateShot(interpolationTime, body.shotMesh, body.weapon);
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

const minimalHeight = 10000;
const velocityVector = [0, 0, 0];
const rotation = [0, 0, 0, 1];

const updatePhysicBody = (state: State) => {
  if (!state.session) {
    return;
  }
  const dt = state.time - state.prevTime;
  const {
    session: { body },
  } = state;

  quat.identity(rotation);
  quat.rotateX(rotation, rotation, body.velocityDirection[0] * dt);
  quat.rotateY(rotation, rotation, body.velocityDirection[1] * dt);
  quat.rotateZ(rotation, rotation, body.velocityDirection[2] * dt);

  quat.mul(body.rotation, body.rotation, rotation);

  vec3.set(velocityVector, 0, body.velocity, 0);
  vec3.transformQuat(velocityVector, velocityVector, body.rotation);

  body.position[0] += velocityVector[0] * dt;
  body.position[1] += velocityVector[1] * dt;
  body.position[2] = Math.max(body.position[2] + velocityVector[2] * dt, minimalHeight);

  updateMesh(body);
  updateShot(state.time, body.shotMesh, body.weapon);
};
