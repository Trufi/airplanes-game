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
  scale: 4000,
  velocity: 30,
  initRotation: { x: -Math.PI / 2, y: 0, z: Math.PI },
  propeller: { x: 0, y: 0, z: 0.666, radius: 0.36, opacity: 0.4 },
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
