import * as vec3 from '@2gis/gl-matrix/vec3';

export const degToRad = (degrees: number) => (degrees * Math.PI) / 180;
export const radToDeg = (radians: number) => (radians * 180) / Math.PI;

export function clamp(value: number, min: number, max: number): number {
  value = Math.max(value, min);
  value = Math.min(value, max);
  return value;
}

export function rotate(v: number[], a: number) {
  const x = v[0];
  const y = v[1];
  v[0] = x * Math.cos(a) + y * Math.sin(a);
  v[1] = -x * Math.sin(a) + y * Math.cos(a);
}

export function angle(v: number[]): number {
  return Math.atan2(v[1], v[0]);
}

// https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
export const quatToEuler = (q: number[]) => {
  // roll (x-axis rotation)
  const sinr_cosp = 2 * (q[3] * q[0] + q[1] * q[2]);
  const cosr_cosp = 1 - 2.0 * (q[0] * q[0] + q[1] * q[1]);
  const roll = Math.atan2(sinr_cosp, cosr_cosp);

  // pitch (y-axis rotation)
  const sinp = 2 * (q[3] * q[1] - q[2] * q[0]);
  let pitch;
  if (Math.abs(sinp) >= 1) {
    pitch = (Math.PI / 2) * Math.sign(sinp);
  } else {
    // use 90 degrees if out of range
    pitch = Math.asin(sinp);
  }

  // yaw (z-axis rotation)
  const siny_cosp = 2 * (q[3] * q[2] + q[0] * q[1]);
  const cosy_cosp = 1 - 2 * (q[1] * q[1] + q[2] * q[2]);
  const yaw = Math.atan2(siny_cosp, cosy_cosp);

  return { roll, pitch, yaw };
};

export const time = () => Date.now();

export const unnormalizeMouse = (v: { x: number; y: number }, size: number[]) => {
  const widthHalf = size[0] / 2;
  const heightHalf = size[1] / 2;

  v.x = v.x * widthHalf + widthHalf;
  v.y = -(v.y * heightHalf) + heightHalf;
};

export const mapMap = <K, V, R>(m: Map<K, V>, cb: (v: V, k: K) => R): R[] => {
  const res: R[] = [];
  m.forEach((v, k) => res.push(cb(v, k)));
  return res;
};

const bodyGlobalAxis = [0, 0, 0];
const xyProjection = [0, 0, 0];

/**
 * Вычисляет угл между плоскостью XY и локальной осью тела.
 * Знак угла зависит от того, с какой стороны от плоскости XY находилась ось тела.
 *
 * @param axis Ось в системе координат тела
 * @param rotation Вращение тела
 */
export const localAxisToXYAngle = (axis: number[], rotation: number[]) => {
  // Переводим локальную ось в глобальную
  vec3.transformQuat(bodyGlobalAxis, axis, rotation);

  // Проекция на плоскость XY
  vec3.copy(xyProjection, bodyGlobalAxis);
  xyProjection[2] = 0;

  return Math.sign(bodyGlobalAxis[2]) * vec3.angle(bodyGlobalAxis, xyProjection);
};

/**
 * Находит медиана в несортированном массиве
 */
export const median = (sample: number[]) => {
  const array = sample.slice();
  array.sort();

  // Не совсем медиана, ну и пофиг
  const medianIndex = Math.floor(array.length / 2);

  return array[medianIndex];
};

/**
 * Находит проекцию вектора А на вектор Б
 */
export const projection = (a: number[], b: number[]) => {
  return vec3.dot(a, b) / vec3.len(b);
};
