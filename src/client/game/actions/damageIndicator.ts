import * as quat from '@2gis/gl-matrix/quat';
import * as vec3 from '@2gis/gl-matrix/vec3';
import * as vec2 from '@2gis/gl-matrix/vec2';
import * as config from '../../../config';
import { degToRad } from '../../utils';
import { checkHit } from './weapon';
import { updateCamera } from './tick';
import { State, PhysicBodyState, DamageIndicatorState, BodyState, CameraState } from '../../types';
import * as THREE from 'three';
import { updateAnimation } from '../animations';

export const createDamageIndicatorState = (): DamageIndicatorState => ({
  prevCheckHealth: config.airplane.maxHealth,
  shooters: new Map(),
});

export const updateDamageIndicator = (state: State) => {
  if (!state.body) {
    return;
  }

  const { damageIndicator, body, time } = state;

  if (body.health < damageIndicator.prevCheckHealth) {
    findShooter(state, body);
    body.animation.is_running = true;
  }
  updateAnimation(body.animation, body.mesh.getObjectByName('Scene'));
  damageIndicator.prevCheckHealth = body.health;

  // Удаляем старые индикаторы
  damageIndicator.shooters.forEach((shooter, bodyId) => {
    if (time - shooter.hitTime > config.damageIndicator.delay) {
      damageIndicator.shooters.delete(bodyId);
    }
  });
};

const forwardDirection = [0, 1, 0];
const bodyForward = [0, 0, 0];
const bodyRotation = [0, 0, 0, 1];
const shooterCamera = {
  position: [0, 0, 0],
  rotation: [0, 0, 0, 1],
};

/**
 * Конфиг оружия для проверка на попадание.
 * Он имеет параметры чуть больше обычного, чтобы покрыть ошибку при передачи данных и пр.
 */
const shooterWeaponConfig = {
  cooldown: config.weapon.cooldown * 0.95,
  distance: config.weapon.distance * 1.05,
  radius: config.weapon.radius * 1.1,
  hitAngle: config.weapon.hitAngle * 1.2,
};

const findShooter = (state: State, target: PhysicBodyState) => {
  const { bodies, time, damageIndicator, camera } = state;

  bodies.forEach((body) => {
    if (target === body || body.type !== 'nonPhysic') {
      return;
    }

    // Для поиска, кто стрелял, берем самый последний слепок,
    // даже если он еще не рендерился
    const lastStep = body.steps[body.steps.length - 1];

    if (time - lastStep.lastShotTime > shooterWeaponConfig.cooldown) {
      return;
    }

    const distance = vec3.distance(target.position, lastStep.position);
    if (distance > shooterWeaponConfig.distance) {
      return;
    }

    updateCamera(lastStep, shooterCamera);

    quat.rotateX(bodyRotation, shooterCamera.rotation, -degToRad(config.camera.pitch));
    vec3.transformQuat(bodyForward, forwardDirection, bodyRotation);

    const canHit = checkHit(
      shooterCamera.position,
      bodyForward,
      target.position,
      shooterWeaponConfig,
    );

    if (canHit) {
      addShooter(damageIndicator, camera, body, time);
    }
  });
};

const v = new THREE.Vector3();

const addShooter = (
  damageIndicator: DamageIndicatorState,
  camera: CameraState,
  body: BodyState,
  time: number,
) => {
  const direction = [0, 0];
  v.fromArray(body.position);
  v.project(camera.object);
  if (v.z < 1) {
    vec2.set(direction, v.x, -v.y);
  } else {
    vec2.set(direction, -v.x, v.y);
  }
  vec2.normalize(direction, direction);

  damageIndicator.shooters.set(body.id, {
    hitTime: time,
    direction,
  });
};
