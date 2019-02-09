import { State } from '../types';
import { Cmd, cmd } from '../commands';
import { msg } from '../messages';

export const tick = (state: State, time: number): Cmd => {
  state.prevTime = state.time;
  state.time = time;

  return cmd.sendMsgToAll(msg.tickData(state));
};
