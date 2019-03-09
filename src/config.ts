export const services = {
  apiDomain: 'http://localhost:3002',
};

export const weapon = {
  // @TODO сделать рандомный дамаг. А конфигом указать диапазон.
  damage: 5,

  /**
   * Меньший радиус усеченного конуса
   */
  radius: 1000,

  /**
   * Угл попадания в градусах
   */
  hitAngle: 3,
  cooldown: 200,
  animationDuration: 40,
  distance: 1000000,
  offset: 5000,
  bullet: {
    color: 0xeeee33,
    opacity: 0.5,
    width: 2,
    offset: { x: 2000, y: 4000, z: 0 },
  },
};

export const airplane = {
  maxHealth: 100,
  scale: 12,
  velocity: 30,
};

export const origin = [82.920412, 55.030111];

export const resurrection = {
  radius: 1000000,
  height: 50000,
};

export const deathNote = {
  delay: 5000,
};
