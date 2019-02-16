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
