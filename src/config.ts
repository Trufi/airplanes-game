import * as dotenv from 'dotenv';

dotenv.config();

export const mainServer = {
  url: process.env.MAIN_SERVER_URL || 'http://localhost:3002',

  /**
   * Если игровой сервер не прислал информацию о себе за это время, то удаляем его
   */
  clearGameThreshold: 30000,

  protector: {
    windowMs: 10 * 60 * 1000, // 10 minutes,
    edgeCountRequest: 600, // limit each IP to 600 requests per windowMs
    delayMs: 500, // begin adding 500ms of delay per request above 100:
    // request # 101 is delayed by  500ms
    // request # 102 is delayed by 1000ms
    // request # 103 is delayed by 1500ms
    // etc.
  },
};

export const tilesUrl = process.env.TILE_SERVER_URL || 'trufi.art:8003';

export const gameServer = {
  url: process.env.GAME_SERVER_URL || 'localhost:3001',
  city: process.env.CITY || 'nsk',
  updateMainInverval: 10000,
  type: process.env.GAME_TYPE || 'dm',
  clientsCheckInterval: 30000,
  secretForCommands: process.env.GAME_SERVER_CMD_SECRET || 'secret555',
};

export const weapon = {
  damage: 8,

  /**
   * Меньший радиус усеченного конуса
   */
  radius: 100,

  /**
   * Угл попадания в градусах
   */
  hitAngle: 2.5,
  cooldown: 200,
  distance: 300000,

  offset: 5000,
  bullet: {
    color: {
      flash: 0xd1780c,
      line: 0xd8c70d,
    },
    opacity: 0.7,
    width: 2,
    offset: { x: 920, y: 1200, z: 500 },
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

  /**
   * Множитель замедления
   */
  slowFactor: 0.5,
};

export const airplane = {
  maxHealth: 100,
  scale: 4,
  velocity: 30,
  initRotation: { x: -Math.PI / 2, y: 0, z: Math.PI },
  propeller: { x: 0, y: 30, z: 666, radius: 250, opacity: 0.4 },

  /**
   * Коэффициент поворота по оси Y в зависимости от угловой скорости
   */
  yRotationFactor: 1500,
};

export const camera = {
  pitch: 90,
  near: 1000,
  far: 2 ** 32, // Можно оставить 600000, но тогда надо поправить frustum
  fov: 45,
};

export const resurrection = {
  radius: 500000,
  height: 50000,
};

export const deathNote = {
  delay: 5000,
};

export const serverGameStep = 100;
export const clientSendChangesInterval = 100;
export const clientPingInterval = 500;
export const smoothPingTime = 2000;
export const minimalHeight = 10000;

export const compression = {
  position: 0.1,
  rotation: 100,
};

/**
 * Если на сервер приходят сообщения старее, чем этот порог, то мы их не принимаем
 * Сделано для того, чтобы игрок в офлайне всех не убил
 */
export const discardMessageThreshold = 1000;

export const points = {
  kills: 250,
  deaths: -100,
};

export const damageIndicator = {
  delay: 300,
};

export const animations = {
  shoot: {
    duration: 5,
    cooldown: 25,
  },
  fireFlash: {
    duration: 5,
    cooldown: 20,
  },
};

export const healPoints = {
  respawnTime: 30000,
  healValue: 50,
  radius: 10000,
  height: 20000,
};

export const mainAirplaneColors = [
  0xd4a73e, // orange
  0x82b64b,
  0x5ab473, // green
  0x6ac8b8,
  0x5688b0, // blue
  0x786dcd,
  0xaa64ce, // violet
  0xb94b73, // red
];
