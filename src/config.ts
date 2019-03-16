export const weapon = {
  damage: 8,

  /**
   * Меньший радиус усеченного конуса
   */
  radius: 100,

  /**
   * Угл попадания в градусах
   */
  hitAngle: 3,
  cooldown: 200,
  animationDuration: 40,
  distance: 300000,

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

export const camera = {
  pitch: 90,
};

export const origin = [82.920412, 55.030111];

export const resurrection = {
  radius: 500000,
  height: 50000,
};

export const deathNote = {
  delay: 5000,
};

export const clientSendChangesInterval = 50;
export const clientPingInterval = 500;
export const minimalHeight = 10000;
