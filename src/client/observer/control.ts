import * as quat from '@2gis/gl-matrix/quat';
import * as vec2 from '@2gis/gl-matrix/vec2';
import * as vec3 from '@2gis/gl-matrix/vec3';
import * as config from '../../config';
import { CameraState } from '../types';
import { degToRad } from '../utils';
import { clamp } from '../../utils';

const rotateButton = 2; // right button

export interface ControlState {
  action: 'none' | 'rotate' | 'drag';

  container: HTMLElement;

  orbit: number[];

  pitch: number;
  rotation: number;

  position: number[];
  target?: { position: number[] };

  startPoint: number[];
  movePoint: number[];

  handlers: {
    mouseUp: (ev: MouseEvent) => void;
    mouseDown: (ev: MouseEvent) => void;
    mouseMove: (ev: MouseEvent) => void;
  };
}

const mouseDown = (state: ControlState, ev: MouseEvent) => {
  ev.preventDefault();

  const { button, clientX, clientY } = ev;

  if (state.action !== 'none') {
    return;
  }

  if (button === rotateButton) {
    state.action = 'rotate';
    vec2.set(state.startPoint, clientX, clientY);
    vec2.copy(state.movePoint, state.startPoint);
  }
};

const mouseUp = (state: ControlState, ev: MouseEvent) => {
  ev.preventDefault();

  const { button } = ev;

  if (state.action === 'rotate' && button === rotateButton) {
    state.action = 'none';
  }
};

const mouseMove = (state: ControlState, ev: MouseEvent) => {
  ev.preventDefault();

  const { clientX, clientY } = ev;

  if (state.action === 'rotate') {
    vec2.set(state.movePoint, clientX, clientY);
  }
};

const preventDefault = (ev: MouseEvent) => ev.preventDefault();

export const enable = (container: HTMLElement): ControlState => {
  const state: ControlState = {
    action: 'none',
    container,
    pitch: 0,
    rotation: 0,
    orbit: [0, 0, 0, 1],
    position: [0, 0, 0],
    startPoint: [0, 0],
    movePoint: [0, 0],
    handlers: {
      mouseUp: () => {},
      mouseDown: () => {},
      mouseMove: () => {},
    },
  };

  state.handlers.mouseUp = mouseUp.bind(undefined, state);
  state.handlers.mouseDown = mouseDown.bind(undefined, state);
  state.handlers.mouseMove = mouseMove.bind(undefined, state);

  container.addEventListener('mouseup', state.handlers.mouseUp);
  container.addEventListener('mousedown', state.handlers.mouseDown);
  container.addEventListener('mousemove', state.handlers.mouseMove);
  container.addEventListener('contextmenu', preventDefault);

  return state;
};

export const disable = (state: ControlState) => {
  const { container, handlers } = state;
  container.removeEventListener('mouseup', handlers.mouseUp);
  container.removeEventListener('mousedown', handlers.mouseDown);
  container.removeEventListener('mousemove', handlers.mouseMove);
  container.removeEventListener('contextmenu', preventDefault);
};

export const setTarget = (state: ControlState, target?: ControlState['target']) => {
  state.target = target;
};

const identity = [0, 0, 0, 1];
const q1 = [0, 0, 0, 1];
const q2 = [0, 0, 0, 1];

export const updateCamera = (state: ControlState, camera: CameraState) => {
  const { action, container, startPoint, movePoint, orbit } = state;

  if (state.target) {
    vec3.copy(state.position, state.target.position);
  }

  if (action === 'rotate') {
    const deltaX = ((movePoint[0] - startPoint[0]) * 2 * Math.PI) / container.clientWidth;
    const deltaY = ((movePoint[1] - startPoint[1]) * 2 * Math.PI) / container.clientHeight;
    vec2.copy(startPoint, movePoint);

    state.pitch = clamp(state.pitch + deltaY, -Math.PI / 2, Math.PI / 2);
    state.rotation += deltaX;

    quat.rotateX(q1, identity, -state.pitch);
    quat.rotateZ(q2, identity, state.rotation);

    quat.multiply(orbit, q2, q1);
  }

  quat.rotateX(camera.rotation, orbit, degToRad(config.camera.pitch));

  // Отодвигаем камеру от самолета
  const shift = [0, 100000, 0];
  vec3.transformQuat(shift, shift, orbit);
  vec3.negate(shift, shift);
  vec3.add(camera.position, state.position, shift);

  camera.position[2] = Math.max(camera.position[2], 0);
};
