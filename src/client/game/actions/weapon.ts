import * as quat from '@2gis/gl-matrix/quat';
import * as vec3 from '@2gis/gl-matrix/vec3';
import { Vector3 } from 'three';
import * as config from '../../../config';
import { degToRad, projection } from '../../utils';
import { State, WeaponState, PhysicBodyState, AnimationPerFrame } from '../../types';
import { clamp } from '../../../utils';

const forwardDirection = [0, 1, 0];
const bodyForward = [0, 0, 0];
const toTarget = [0, 0, 0];
const bodyRotation = [0, 0, 0, 1];

const fire = (state: State, body: PhysicBodyState) => {
  const {
    bodies,
    camera: { rotation, position },
  } = state;

  const { weapon } = body;

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

export const changeHeat = (weapon: WeaponState, delta: number) => {
  weapon.heat = clamp(weapon.heat + delta, 0, config.weapon.maxHeat);
};

export const updateWeapon = (state: State, tryUse: boolean) => {
  const { body } = state;
  if (!body) {
    return;
  }
  const { weapon } = body;

  if (tryUse && !weapon.blocked) {
    const canUse = state.time - weapon.lastShotTime > config.weapon.cooldown;

    if (canUse && weapon.heat < config.weapon.maxHeat) {
      fire(state, body);
      changeHeat(weapon, config.weapon.heatPerFire);

      // Перегрев ускорения — блокируем, пока не остынет полностью
      if (weapon.heat === config.weapon.maxHeat) {
        weapon.blocked = true;
      }
    }
  } else {
    if (weapon.heat > 0) {
      const dt = state.time - state.prevTime;
      changeHeat(weapon, -(config.weapon.restoringSpeed / 1000) * dt);

      if (weapon.blocked && weapon.heat === 0) {
        weapon.blocked = false;
      }
    }
  }
};

export const updateWeaponAnimation = (
  weapon: {
    animation: AnimationPerFrame;
    lastShotTime: number;
  },
  time: number,
) => {
  if (time - weapon.lastShotTime < config.weapon.cooldown) {
    weapon.animation.is_running = true;
  } else {
    weapon.animation.is_running = false;
  }
};
