export const weapon = {
  damage: 5,

  /**
   * Меньший радиус усеченного конуса
   */
  radius: 1000,

  /**
   * Угл попадания в градусах
   */
  hitAngle: 2,
  cooldown: 100,
  animationDuration: 40,
  distance: 1000000,
  offset: 5000,
  bullet: {
    color: 0xff3333,
    opacity: 0.5,
    width: 2,
    offset: { x: 3000, y: 0, z: -500 }
  }
};

export const airplane = {
  maxHealth: 100,
};

export const origin = [82.920412, 55.030111];

export const deathNote = {
  delay: 5000,
};
