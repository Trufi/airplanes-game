import { hideOldNotes } from '../common/notes';
import { ObserverState } from './types';
import { updateNonPhysicBody } from '../game/actions/tick';
import * as view from '../game/view';

export const tick = (state: ObserverState, time: number) => {
  state.prevTime = state.time;
  state.time = time;

  state.bodies.forEach((body) => updateNonPhysicBody(body, time, state.serverTime.diff));

  updateCamera(state);
  hideOldNotes(state.notes, time);

  view.updateCameraAndMap(state);
};

const updateCamera = (state: ObserverState) => {
  state.camera.position = state.origin;
};
