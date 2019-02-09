// import * as vec2 from '@2gis/gl-matrix/vec2';
import { clamp, rotate } from './utils';

const rollSpeed = 0.001;
const rollComebackSpeed = 0.0002;
const velocity = 40;
const rotationСoefficient = 0.001;

export class AirplaneBody {
  public position: number[];
  public velocity: number[];
  public roll: number;

  constructor() {
    this.position = [0, 0];
    this.velocity = [0, velocity];
    this.roll = 0;
  }

  public tick(dt: number) {
    const angle = this.roll * rotationСoefficient * dt;
    rotate(this.velocity, angle);

    this.position[0] += this.velocity[0] * dt;
    this.position[1] += this.velocity[1] * dt;
  }

  public rollLeft(dt: number) {
    this.roll = clamp(this.roll - rollSpeed * dt, -Math.PI / 2, Math.PI / 2);
  }

  public rollRight(dt: number) {
    this.roll = clamp(this.roll + rollSpeed * dt, -Math.PI / 2, Math.PI / 2);
  }

  public restoreRoll(dt: number) {
    if (Math.abs(this.roll) < rollComebackSpeed * dt) {
      this.roll = 0;
    } else if (this.roll > 0) {
      this.roll = Math.max(0, this.roll - rollComebackSpeed * dt);
    } else if (this.roll < 0) {
      this.roll = Math.min(0, this.roll + rollComebackSpeed * dt);
    }
  }
}
