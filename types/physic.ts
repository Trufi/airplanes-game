export interface Airplane {
  id: number;
  position: number[];
  quaternion: number[]; // кватернион
  velocity: number[];
}

export type Body = Airplane;
