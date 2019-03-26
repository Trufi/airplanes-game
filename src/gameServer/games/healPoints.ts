import * as config from '../../config';
import { City } from '../../types';
import { Cmd, cmd, union } from '../commands';
import { msg } from '../messages';
import { State, PlayerConnection } from '../types';
import { clamp } from '../../utils';
import { ClientMsg } from '../../client/messages';
import { healPointsByCity } from '../../cities';

export interface HealPoint {
  id: number;
  live: boolean;
  takeTime: number;
  position: number[];
}

export interface HealPointsState {
  points: Map<number, HealPoint>;
}

const createHealPoint = (position: number[], id: number): HealPoint => ({
  id,
  live: true,
  takeTime: 0,
  position,
});

export const createHealPointsState = (city: City): HealPointsState => {
  const cityPoints = healPointsByCity[city];

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
  state: State,
  clientMsg: ClientMsg['takeHealPoint'],
  connection: PlayerConnection,
): Cmd => {
  const { game } = state;
  const {
    healPoints: { points },
    bodies,
    players,
  } = game;
  const { id, time } = clientMsg;

  if (game.time - time > config.discardMessageThreshold) {
    return;
  }

  const point = points.get(id);
  const player = players.get(connection.id);
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
  return cmd.sendMsgToAllInGame(msg.healPointWasTaken(id));
};
