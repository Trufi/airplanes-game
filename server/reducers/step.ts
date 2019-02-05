import { State } from '../types';
import { Cmd, sendPlayersTickDataCmd } from '../commands';

export const tick = (state: State, time: number): Cmd => {
  state.prevTime = state.time;
  state.time = time;

  // TODO: применение действий и обновление физики
  return sendPlayersTickDataCmd();
};
