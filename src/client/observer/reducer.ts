import { AnyServerMsg } from '../../gameServer/messages';
import { Cmd } from '../commands';
import { ObserverState } from './types';
import { updatePingAndServerTime } from '../common/serverTime';
import {
  updateGameData,
  removePlayer,
  playerDeath,
  playerNewBody,
  playerEnter,
  restartAt,
  restartData,
} from '../game/actions/message';

export const message = (state: ObserverState, msg: AnyServerMsg): Cmd => {
  switch (msg.type) {
    case 'tickData':
      return updateGameData(state, msg);
    case 'playerEnter':
      return playerEnter(state, msg);
    case 'playerLeave':
      return removePlayer(state, msg);
    case 'playerDeath':
      return playerDeath(state, msg);
    case 'playerNewBody':
      return playerNewBody(state, msg);
    case 'pong':
      return updatePingAndServerTime(state.serverTime, msg);
    case 'restartAt':
      return restartAt(state, msg);
    case 'restartData':
      return restartData(state, msg);
  }
};
