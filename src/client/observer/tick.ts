import { hideOldNotes } from '../common/notes';
import { ObserverState } from './types';
import { updateNonPhysicBody } from '../game/actions/tick';
import * as view from '../game/view';
import * as control from './control';

export const tick = (state: ObserverState, time: number) => {
  state.prevTime = state.time;
  state.time = time;

  state.bodies.forEach((body) => updateNonPhysicBody(body, time, state.serverTime.diff));

  control.updateCamera(state.control, state.camera, state.time - state.prevTime);

  hideOldNotes(state.notes, time);

  view.updateCameraAndMap(state);
};
