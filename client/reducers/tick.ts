import * as quat from '@2gis/gl-matrix/quat';
import * as vec3 from '@2gis/gl-matrix/vec3';
import { State, NonPhysicBodyState, BodyStep, PhysicBodyState } from '../types';
import { updateMesh } from '../view';
import { quatToEuler } from '../utils';

export const tick = (state: State, time: number) => {
  state.prevTime = state.time;
  state.time = time;

  const dt = state.time - state.prevTime;

  state.bodies.forEach((body) => updateNonPhysicBody(body, state.time));

  if (state.session) {
    updatePhysicBody(state.session.body, dt);
  }
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

const rotationСoefficient = 0.001;
const q = quat.create();
const zAxis = [0, 0, 1];

const updatePhysicBody = (body: PhysicBodyState, dt: number) => {
  const euler = quatToEuler(body.rotation);
  const angle = euler.pitch * rotationСoefficient * dt;

  quat.setAxisAngle(q, zAxis, -angle);
  quat.mul(body.rotation, q, body.rotation);

  vec3.transformQuat(body.velocity, body.velocity, q);

  body.position[0] += body.velocity[0] * dt;
  body.position[1] += body.velocity[1] * dt;

  updateMesh(body);
};
