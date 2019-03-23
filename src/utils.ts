import * as vec2 from '@2gis/gl-matrix/vec2';
import * as config from './config';

export const mapMap = <K, V, R>(m: Map<K, V>, cb: (v: V, k: K) => R): R[] => {
  const res: R[] = [];
  m.forEach((v, k) => res.push(cb(v, k)));
  return res;
};

export const mapToArray = <K, V>(m: Map<K, V>): V[] => {
  return mapMap(m, (v) => v);
};

export const findMap = <K, V>(m: Map<K, V>, cb: (v: V, k: K) => boolean): V | undefined => {
  for (const [k, v] of m) {
    const res = cb(v, k);
    if (res) {
      return v;
    }
  }
};

export function clamp(value: number, min: number, max: number) {
  value = Math.max(value, min);
  value = Math.min(value, max);
  return value;
}

export const lerp = (a: number, b: number, t: number) => a + t * (b - a);

export const pick = <T extends { [key: string]: any }, K extends keyof T, U extends Pick<T, K>>(
  obj: T,
  targetProps: K[],
): U => {
  const targetObj = {} as U;
  for (let i = 0; i < targetProps.length; i++) {
    targetObj[targetProps[i]] = obj[targetProps[i]];
  }
  return targetObj;
};

export type ObjectElement<T> = T[keyof T];
export type ArrayElement<ArrayType> = ArrayType extends Array<infer ElementType>
  ? ElementType
  : never;

const na = [0, 0];
const nb = [0, 0];
export function vec2SignedAngle(a: number[], b: number[]): number {
  const z = a[0] * b[1] - a[1] * b[0];
  vec2.normalize(na, a);
  vec2.normalize(nb, b);
  const angle = Math.acos(vec2.dot(na, nb));

  return z > 0 ? angle : -angle;
}

/**
 * Возвращает новое количество очков игрока в завимости от смерти или кила
 * @TODO использовать рейтинг Эло. Для начисления рейтинга. [#ratingElo]
 * https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D0%B9%D1%82%D0%B8%D0%BD%D0%B3_%D0%AD%D0%BB%D0%BE
 */
export const getNewPoints = (currentPoints: number, type: 'deaths' | 'kills') => {
  return Math.max(0, currentPoints + config.points[type]);
};
