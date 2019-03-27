import * as config from '../../../config';
import { PhysicBodyState, BoostState } from '../../types';
import { clamp } from '../../../utils';

export const createBoostState = (): BoostState => ({
  volume: config.boost.maxVolume,
  blocked: false,
});

const changeVolume = (boost: BoostState, delta: number) => {
  boost.volume = clamp(boost.volume + delta, 0, config.boost.maxVolume);
};

/**
 * @param tryUse Пробует ли пользователь использовать ускорение
 */
export const updateBoost = (body: PhysicBodyState, dt: number, tryUse: boolean) => {
  const { boost } = body;

  if (tryUse && !boost.blocked) {
    if (boost.volume > 0) {
      body.velocity = config.airplane.velocity * config.boost.factor;
      changeVolume(boost, -(config.boost.spendingSpeed / 1000) * dt);

      // Перегрев ускорения — блокируем, пока не остынет полностью
      if (boost.volume === 0) {
        boost.blocked = true;
      }
    }
  } else {
    body.velocity = config.airplane.velocity;
    if (boost.volume < config.boost.maxVolume) {
      changeVolume(boost, (config.boost.restoringSpeed / 1000) * dt);

      if (boost.blocked && boost.volume === config.boost.maxVolume) {
        boost.blocked = false;
      }
    }
  }
};

/**
 * @param tryUse Пробует ли пользователь тормозить
 */
export const updateSlow = (body: PhysicBodyState, dt: number, tryUse: boolean) => {
  if (tryUse) {
    body.velocity = Math.max(config.airplane.velocity, body.velocity) * config.boost.slowFactor;
  }
};
