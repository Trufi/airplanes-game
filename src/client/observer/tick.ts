import { hideOldNotes } from '../common/notes';
import { ObserverState } from './types';
import { updateNonPhysicBody } from '../game/actions/tick';
import * as view from '../game/view';
import * as control from './control';

export const tick = (state: ObserverState, time: number) => {
  state.prevTime = state.time;
  state.time = time;

  state.bodies.forEach((body) => updateNonPhysicBody(body, time, state.serverTime.diff));

  const nextBodyValue = state.bodies.entries().next().value;
  if (nextBodyValue) {
    control.setTarget(state.control, nextBodyValue[1]);
  } else {
    control.setTarget(state.control);
  }

  control.updateCamera(state.control, state.camera);

  hideOldNotes(state.notes, time);

  view.updateCameraAndMap(state);
};
