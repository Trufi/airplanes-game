import * as config from '../../config';
import { City } from '../../types';
import { Cmd, cmd, union } from '../commands';
import { msg } from '../messages';
import { GameState } from '../types';
import { clamp } from '../../utils';

export interface HealPoint {
  id: number;
  live: boolean;
  takeTime: number;
  position: number[];
}

export interface HealPointsState {
  points: Map<number, HealPoint>;
}

const pointsPositionByCity: { [key in City]: number[][] } = {
  nsk: [
    [989329080, 789625871], // Оперный
    [988990162, 789736310], // Вокзал
    [989345854, 789964008], // Повыше Гелереи
    [989013840, 788583552], // Сан-Сити
    [989787138, 788478977], // Бугринский мост
  ],
};

const createHealPoint = (position: number[], id: number): HealPoint => ({
  id,
  live: true,
  takeTime: 0,
  position,
});

export const createHealPointsState = (city: City): HealPointsState => {
  const cityPoints = pointsPositionByCity[city];

  const points = new Map<number, HealPoint>();
  let nextId = 1;
  cityPoints.forEach((p) => {
    points.set(nextId, createHealPoint(p, nextId));
    nextId++;
  });

  return {
    points,
  };
};

export const updateHealPoints = (state: HealPointsState, time: number): Cmd => {
  const cmds: Cmd[] = [];

  state.points.forEach((healPoint) => {
    if (!healPoint.live && time - healPoint.takeTime > config.healPoints.respawnTime) {
      healPoint.live = true;
      cmds.push(cmd.sendMsgToAllInGame(msg.healPointAlive(healPoint.id)));
    }
  });

  return union(cmds);
};

export const restartHealPoints = (state: HealPointsState): Cmd => {
  state.points.forEach((hp) => {
    hp.live = true;
    hp.takeTime = 0;
  });
};

export const healPointWasTaken = (
  game: GameState,
  time: number,
  pointId: number,
  playerId: number,
): Cmd => {
  const {
    healPoints: { points },
    bodies,
    players,
  } = game;

  const point = points.get(pointId);
  const player = players.get(playerId);
  if (!player || !point) {
    return;
  }

  const body = bodies.map.get(player.bodyId);
  if (!body) {
    return;
  }

  body.health = clamp(body.health + config.healPoints.healValue, 0, config.airplane.maxHealth);

  point.live = false;
  point.takeTime = time;
  return cmd.sendMsgToAllInGame(msg.healPointWasTaken(pointId));
};
