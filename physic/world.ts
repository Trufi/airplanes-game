export class World {
  private bodies: { [id: string]: Body[] };

  constructor() {
    this.bodies = {};
  }

  public update() {
    console.log(this.bodies);
  }
}
