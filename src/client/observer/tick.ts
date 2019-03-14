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
  const nextBodyValue = state.bodies.entries().next().value;
  if (!nextBodyValue) {
    state.camera.position[0] = 0;
    state.camera.position[1] = 0;
    state.camera.position[2] = 1000000;
  } else {
    const body = nextBodyValue[1];
    state.camera.position[0] = body.position[0];
    state.camera.position[1] = body.position[1];
    state.camera.position[2] = 200000;
  }
};
