export const weapon = {
  damage: 8,

  /**
   * Меньший радиус усеченного конуса
   */
  radius: 100,

  /**
   * Угл попадания в градусах
   */
  hitAngle: 0,
  cooldown: 200,
  animationDuration: 5,
  animationCooldown: 25,
  distance: 300000,

  offset: 5000,
  bullet: {
    color: 0xeeee33,
    opacity: 0.5,
    width: 2,
    offset: { x: 900, y: 0, z: 500 },
  },

  /**
   * Скорость охлаждения в секунду
   */
  restoringSpeed: 20,
  /**
   * Перегрев за 1 выстрел
   */
  heatPerFire: 5,

  /**
   * Максимальный перегрев
   */
  maxHeat: 100,
};

export const boost = {
  /**
   * Скорость восстановления ускорения в секунду
   */
  restoringSpeed: 0.25,
  /**
   * Скорость траты ускорения в секунду
   */
  spendingSpeed: 1,

  /**
   * Множитель, на который умножается обычная скорость самолета при ускорении
   */
  factor: 2.5,

  maxVolume: 4,
};

export const airplane = {
  maxHealth: 100,
  scale: 4000,
  velocity: 30,
  initRotation: { x: -Math.PI / 2, y: 0, z: Math.PI },
  propeller: { x: 0, y: 0, z: 0.666, radius: 0.36, opacity: 0.4 },

  /**
   * Коэффициент поворота по оси Y в зависимости от угловой скорости
   */
  yRotationFactor: 1500,
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

export const points = {
  kills: 250,
  deaths: -100,
};
