export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function clamp(value: number, min: number, max: number): number {
  value = Math.max(value, min);
  value = Math.min(value, max);
  return value;
}

export function rotate(v: number[], a: number) {
  v[0] = v[0] * Math.cos(a) + v[1] * Math.sin(a);
  v[1] = -v[0] * Math.sin(a) + v[1] * Math.cos(a);
}

export function angle(v: number[]): number {
  return Math.atan2(v[1], v[0]);
}
