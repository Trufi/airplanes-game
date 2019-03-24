import * as quat from '@2gis/gl-matrix/quat';
import * as vec2 from '@2gis/gl-matrix/vec2';
import * as vec3 from '@2gis/gl-matrix/vec3';
import * as THREE from 'three';
import * as config from '../../config';
import { CameraState } from '../types';
import { degToRad } from '../utils';
import { clamp } from '../../utils';
import { updateCamera as updateCameraAsGame } from '../game/actions/tick';

const dragButton = 0; // left button
const rotateButton = 2; // right button
const defaultDistance = 100000;
const minDistance = 10000;

export interface ControlState {
  action: 'none' | 'rotate' | 'drag';

  container: HTMLElement;

  orbit: number[];

  pitch: number;
  rotation: number;
  distance: number;

  target?: { id: number; position: number[]; rotation: number[] };
  view: boolean;

  /**
   * Если есть цель, то эта позиция становится равной позиции цели и не лежит в плоскости карты
   */
  position: number[];

  /**
   * А эта позиция всегда лежит на плоскости карты
   * Она выставляется, когда сбрасывается цель
   */
  planePosition: number[];
  planeDistance: number;

  startPoint: number[];
  movePoint: number[];

  wheelDelta: number;

  handlers: {
    mouseUp: (ev: MouseEvent) => void;
    mouseDown: (ev: MouseEvent) => void;
    mouseMove: (ev: MouseEvent) => void;
    wheel: (ev: WheelEvent) => void;
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
  } else if (button === dragButton) {
    state.action = 'drag';
    vec2.set(state.startPoint, clientX, clientY);
    vec2.copy(state.movePoint, state.startPoint);

    // Сбросим цель
    setTarget(state);
  }
};

const mouseUp = (state: ControlState, ev: MouseEvent) => {
  ev.preventDefault();

  const { button } = ev;

  if (
    (state.action === 'rotate' && button === rotateButton) ||
    (state.action === 'drag' && button === dragButton)
  ) {
    state.action = 'none';
  }
};

const mouseMove = (state: ControlState, ev: MouseEvent) => {
  ev.preventDefault();

  const { clientX, clientY } = ev;

  if (state.action === 'rotate' || state.action === 'drag') {
    vec2.set(state.movePoint, clientX, clientY);
  }
};

const wheel = (state: ControlState, ev: WheelEvent) => {
  // В FF под маком на скролл мыши вызывается событие
  // с deltaMode = 1 (разница в строках, а не пикслеях)
  // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
  if (ev.deltaMode === 1) {
    state.wheelDelta -= ev.deltaY * 20;
  } else {
    // обычная ситуация
    state.wheelDelta -= ev.deltaY;
  }
};

const preventDefault = (ev: MouseEvent) => ev.preventDefault();

export const enable = (container: HTMLElement): ControlState => {
  const state: ControlState = {
    action: 'none',
    container,
    pitch: 0,
    rotation: 0,
    distance: defaultDistance,
    orbit: [0, 0, 0, 1],
    position: [0, 0, 0],
    planePosition: [0, 0, 0],
    planeDistance: 0,
    startPoint: [0, 0],
    movePoint: [0, 0],
    wheelDelta: 0,
    view: false,
    handlers: {
      mouseUp: () => {},
      mouseDown: () => {},
      mouseMove: () => {},
      wheel: () => {},
    },
  };

  state.handlers.mouseUp = mouseUp.bind(undefined, state);
  state.handlers.mouseDown = mouseDown.bind(undefined, state);
  state.handlers.mouseMove = mouseMove.bind(undefined, state);
  state.handlers.wheel = wheel.bind(undefined, state);

  container.addEventListener('mouseup', state.handlers.mouseUp);
  container.addEventListener('mousedown', state.handlers.mouseDown);
  container.addEventListener('mousemove', state.handlers.mouseMove);
  container.addEventListener('wheel', state.handlers.wheel);
  container.addEventListener('contextmenu', preventDefault);

  return state;
};

export const disable = (state: ControlState) => {
  const { container, handlers } = state;
  container.removeEventListener('mouseup', handlers.mouseUp);
  container.removeEventListener('mousedown', handlers.mouseDown);
  container.removeEventListener('mousemove', handlers.mouseMove);
  container.removeEventListener('wheel', state.handlers.wheel);
  container.removeEventListener('contextmenu', preventDefault);
};

export const setTarget = (state: ControlState, target?: ControlState['target']) => {
  // Если цели до этого не было, то сбрасываем дистацнию до дефолтной
  // Если цель была, то дистацния должна остаться такой же, чтобы камера не скакала
  if (!state.target) {
    state.distance = defaultDistance;
  }
  state.target = target;

  if (target === undefined) {
    vec3.copy(state.position, state.planePosition);
    state.distance = state.planeDistance;
    state.view = false;
  }
};

const identity = [0, 0, 0, 1];
const q1 = [0, 0, 0, 1];
const q2 = [0, 0, 0, 1];
const shift = [0, 0, 0];

const normalizeMousePosition = (mouse: THREE.Vector2, point: number[]) => {
  mouse.x = (point[0] / window.innerWidth) * 2 - 1;
  mouse.y = -(point[1] / window.innerHeight) * 2 + 1;
};

const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
const mouse = new THREE.Vector2();
const startVector = new THREE.Vector3();
const moveVector = new THREE.Vector3();

const setPitch = (state: ControlState, x: number) => {
  state.pitch = clamp(x, -Math.PI / 2, Math.PI / 2);
  state.view = false;
};

const addPitch = (state: ControlState, delta: number) => setPitch(state, state.pitch + delta);

const setRotation = (state: ControlState, x: number) => {
  state.rotation = x;
  state.view = false;
};

const addRotation = (state: ControlState, delta: number) =>
  setRotation(state, state.rotation + delta);

const setDistance = (state: ControlState, x: number) => {
  state.distance = Math.max(minDistance, x);
  state.view = false;
};

const addDistance = (state: ControlState, delta: number) =>
  setDistance(state, state.distance - delta);

export const updateCamera = (state: ControlState, camera: CameraState) => {
  const {
    action,
    container,
    startPoint,
    movePoint,
    orbit,
    position,
    target,
    planePosition,
    view: playerView,
  } = state;

  if (target) {
    vec3.copy(position, target.position);
  }

  if (target && playerView) {
    updateCameraAsGame(target, camera);
  } else {
    // Обработаем изменение расстояния
    addDistance(state, state.wheelDelta * 100);
    state.wheelDelta = 0;

    if (action === 'rotate') {
      const deltaX = ((movePoint[0] - startPoint[0]) * 2 * Math.PI) / container.clientWidth;
      const deltaY = ((movePoint[1] - startPoint[1]) * 2 * Math.PI) / container.clientHeight;
      vec2.copy(startPoint, movePoint);

      addPitch(state, deltaY);
      addRotation(state, deltaX);
    } else if (action === 'drag') {
      normalizeMousePosition(mouse, startPoint);
      raycaster.setFromCamera(mouse, camera.object);

      const startIntersect = raycaster.ray.intersectPlane(plane, startVector);

      if (startIntersect !== null) {
        normalizeMousePosition(mouse, movePoint);
        raycaster.setFromCamera(mouse, camera.object);

        const moveIntersection = raycaster.ray.intersectPlane(plane, moveVector);

        if (moveIntersection !== null) {
          position[0] += startVector.x - moveVector.x;
          position[1] += startVector.y - moveVector.y;

          vec2.copy(startPoint, movePoint);
        }
      }
    }

    // Обновляем orbit
    quat.rotateX(q1, identity, -state.pitch);
    quat.rotateZ(q2, identity, state.rotation);
    quat.multiply(orbit, q2, q1);

    // Обновляем камеру
    quat.rotateX(camera.rotation, orbit, degToRad(config.camera.pitch));

    // Отодвигаем камеру от самолета
    vec3.set(shift, 0, state.distance, 0);
    vec3.transformQuat(shift, shift, orbit);
    vec3.negate(shift, shift);
    vec3.add(camera.position, state.position, shift);

    camera.position[2] = Math.max(camera.position[2], 0);
  }

  if (target) {
    // На самом деле можно использовать только Ray, без камеры и Raycaster
    mouse.set(0, 0);
    raycaster.setFromCamera(mouse, camera.object);
    const intersect = raycaster.ray.intersectPlane(plane, startVector);
    if (intersect !== null) {
      vec2.set(planePosition, startVector.x, startVector.y);
      state.planeDistance = Math.max(
        minDistance,
        vec3.distance(camera.position, state.planePosition),
      );
    } else {
      vec2.copy(planePosition, position);
      state.planeDistance = state.distance;
    }
  } else {
    vec2.copy(planePosition, position);
    state.planeDistance = state.distance;
  }
};

const temp = [0, 0, 0];
const keyRotateDelta = 0.001;
const keyDragDelta = 100;

const yAxis = [0, 1, 0];
const setForwardOnPlane = (out: number[], rotation: number[]) => {
  vec3.transformQuat(out, yAxis, rotation);
  out[2] = 0;
  vec3.normalize(out, out);
};

const xAxis = [1, 0, 0];
const setLeftOnPlane = (out: number[], rotation: number[]) => {
  vec3.transformQuat(out, xAxis, rotation);
  out[2] = 0;
  vec3.normalize(out, out);
};

export const up = (state: ControlState, dt: number) => {
  const { target, orbit, position } = state;

  if (target) {
    addPitch(state, keyRotateDelta * dt);
  } else {
    setForwardOnPlane(temp, orbit);
    vec3.scale(temp, temp, keyDragDelta * dt);
    vec3.add(position, position, temp);
  }
};

export const down = (state: ControlState, dt: number) => {
  const { target, orbit, position } = state;

  if (target) {
    addPitch(state, -keyRotateDelta * dt);
  } else {
    setForwardOnPlane(temp, orbit);
    vec3.scale(temp, temp, -keyDragDelta * dt);
    vec3.add(position, position, temp);
  }
};

export const left = (state: ControlState, dt: number) => {
  const { target, orbit, position } = state;

  if (target) {
    addRotation(state, -keyRotateDelta * dt);
  } else {
    setLeftOnPlane(temp, orbit);
    vec3.scale(temp, temp, -keyDragDelta * dt);
    vec3.add(position, position, temp);
  }
};

export const right = (state: ControlState, dt: number) => {
  const { target, orbit, position } = state;

  if (target) {
    addRotation(state, keyRotateDelta * dt);
  } else {
    setLeftOnPlane(temp, orbit);
    vec3.scale(temp, temp, keyDragDelta * dt);
    vec3.add(position, position, temp);
  }
};

const distanceKeyDelta = 100;
export const farther = (state: ControlState, dt: number) => {
  addDistance(state, -distanceKeyDelta * dt);
};

export const closer = (state: ControlState, dt: number) => {
  addDistance(state, distanceKeyDelta * dt);
};

export const topView = (state: ControlState) => {
  setPitch(state, Math.PI / 2);
  setRotation(state, 0);
  setDistance(state, 1000000);
};

export const nearView = (state: ControlState) => {
  setDistance(state, defaultDistance);
  setPitch(state, Math.PI / 8);
};

export const playerView = (state: ControlState) => {
  if (!state.target) {
    return;
  }
  state.view = true;
};
