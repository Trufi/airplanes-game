import * as quat from '@2gis/gl-matrix/quat';
import * as vec3 from '@2gis/gl-matrix/vec3';
import { State, NonPhysicBodyState, BodyStep } from '../types';
import { updateMesh, updateShot } from '../view';

export const tick = (state: State, time: number) => {
  state.prevTime = state.time;
  state.time = time;

  state.bodies.forEach((body) => updateNonPhysicBody(body, state.time));

  updatePhysicBody(state);
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

  body.health = endStep.health;

  updateMesh(body);
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
const velocity = [0, 10, 0];

const updatePhysicBody = (state: State) => {
  if (!state.session) {
    return;
  }
  const dt = state.time - state.prevTime;
  const {
    session: { body },
    weapon,
  } = state;

  vec3.transformQuat(body.velocity, velocity, body.rotation);

  body.position[0] += body.velocity[0] * dt;
  body.position[1] += body.velocity[1] * dt;
  body.position[2] = Math.max(body.position[2] + body.velocity[2] * dt, minimalHeight);

  updateMesh(body);
  updateShot(state.time, body.shotMesh, weapon);
};
