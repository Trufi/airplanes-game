import { hideOldNotes } from '../common/notes';
import { ObserverState } from './types';
import { updateNonPhysicBody } from '../game/actions/tick';
import * as view from '../game/view';
import * as control from './control';
import { keyboard } from './keyboard';

export const tick = (state: ObserverState, time: number) => {
  state.prevTime = state.time;
  state.time = time;

  processPressedKeys(state);

  state.bodies.forEach((body) => updateNonPhysicBody(body, time, state.serverTime.diff));

  const nextBodyValue = state.bodies.entries().next().value;
  if (nextBodyValue) {
    control.setTarget(state.control, nextBodyValue[1]);
  } else {
    // control.setTarget(state.control);
  }

  control.updateCamera(state.control, state.camera);

  hideOldNotes(state.notes, time);

  view.updateCameraAndMap(state);
};

const processPressedKeys = (state: ObserverState) => {
  const pressedKeys = keyboard.getPressedKeys(state.keyboard);

  for (const key of pressedKeys) {
    switch (key) {
      case 'KeyW':
        control.up(state.control, state.time - state.prevTime);
        break;
      case 'KeyS':
        control.down(state.control, state.time - state.prevTime);
        break;
      case 'KeyA':
        control.left(state.control, state.time - state.prevTime);
        break;
      case 'KeyD':
        control.right(state.control, state.time - state.prevTime);
        break;
    }
  }
};
