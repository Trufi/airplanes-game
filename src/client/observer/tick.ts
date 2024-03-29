import { hideOldNotes } from '../common/notes';
import { ObserverState } from './types';
import { updateNonPhysicBody } from '../game/actions/tick';
import * as view from '../game/view';
import * as control from './control';
import { keyboard } from '../common/keyboard';
import { updateHealPoints } from '../game/actions/healPoints';

export const tick = (state: ObserverState, time: number) => {
  state.prevTime = state.time;
  state.time = time;

  processPressedKeys(state);

  state.bodies.forEach((body) => updateNonPhysicBody(state, body));

  updateHealPoints(state);

  control.updateCamera(state.control, state.camera);

  hideOldNotes(state.notes, time);

  view.updateCameraAndMap(state);
};

const processPressedKeys = (state: ObserverState) => {
  const pressedKeys = keyboard.getPressedKeys(state.keyboard);
  const dt = state.time - state.prevTime;

  for (const key of pressedKeys) {
    switch (key) {
      case 'KeyW':
        control.up(state.control, dt);
        break;
      case 'KeyS':
        control.down(state.control, dt);
        break;
      case 'KeyA':
        control.left(state.control, dt);
        break;
      case 'KeyD':
        control.right(state.control, dt);
        break;
      case 'KeyR':
        control.closer(state.control, dt);
        break;
      case 'KeyF':
        control.farther(state.control, dt);
        break;
      case 'Digit1':
        control.playerView(state.control);
        break;
      case 'Digit2':
        control.nearView(state.control);
        break;
      case 'Digit3':
        control.topView(state.control);
        break;
    }
  }
};
