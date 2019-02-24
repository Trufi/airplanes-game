export const mapMap = <K, V, R>(m: Map<K, V>, cb: (v: V, k: K) => R): R[] => {
  const res: R[] = [];
  m.forEach((v, k) => res.push(cb(v, k)));
  return res;
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
