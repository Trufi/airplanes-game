import { setEyePosition, radToDeg } from '@2gis/jakarta/dist/es6/utils/common';
import { projectMapToGeo, projectGeoToMap, heightToZoom } from '@2gis/jakarta/dist/es6/utils/geo';
import { Map, config } from '@2gis/jakarta';
import { msg, AnyClientMsg } from './messages';
import { AnyServerMsg } from '../server/messages';
import { message } from './reducers';
import { createState } from './state';
import { angle, degToRad } from './utils';
import { tick } from './reducers/tick';
import { processPressedkeys } from './reducers/actions';

declare const THREE: any;

const state = createState(Date.now());

const ws = new WebSocket(`ws://${location.hostname}:3001/`);

function sendMessage(msg: AnyClientMsg) {
  ws.send(JSON.stringify(msg));
}

ws.addEventListener('open', () => {
  console.log('Connected');

  sendMessage(msg.start(`Random-${Math.round(Math.random() * 100)}`));
});

ws.addEventListener('close', () => {
  console.log('Disconnected');
});

ws.addEventListener('message', (ev) => {
  let msg: AnyServerMsg;

  try {
    msg = JSON.parse(ev.data);
  } catch (e) {
    console.error(`Bad server message ${ev.data}`);
    return;
  }

  message(state, msg);
});

const height = 80000;

const container = document.getElementById('map') as HTMLElement;
const options = {
  center: [82.920412, 55.030111],
  zoom: heightToZoom(height + 25000, [window.innerWidth, window.innerHeight]),
  sendAnalytics: false,
  fontUrl: './assets/fonts',
};
const map = ((window as any).map = new Map(container, options));

window.addEventListener('resize', () => map.invalidateSize());

const pressedKeys: { [key: string]: boolean } = {};

window.addEventListener('keydown', (ev) => {
  pressedKeys[ev.code] = true;
});

window.addEventListener('keyup', (ev) => {
  pressedKeys[ev.code] = false;
});

const camera = new THREE.PerspectiveCamera(
  config.camera.fov,
  window.innerWidth / window.innerHeight,
  config.camera.near,
  config.camera.far,
);
camera.position.z = 1;
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('overlay') as HTMLCanvasElement,
  alpha: true,
  antialias: true,
});

const onResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

window.addEventListener('resize', onResize);
onResize();

function loop() {
  requestAnimationFrame(loop);
  if (!state.session) {
    return;
  }

  const time = Date.now();

  processPressedkeys(time - state.time, state, pressedKeys);

  tick(state, time);

  const body = state.session.body;

  const rotation = angle(body.velocity);
  map.setCenter(projectMapToGeo(body.position), { animate: false });
  map.setRotation(radToDeg(rotation - Math.PI / 2));

  const eye = [0, 0, 0];
  setEyePosition(eye, map.map.state);

  const a = new THREE.Euler(0, 0, degToRad(map.getRotation()), 'XYZ');
  camera.setRotationFromEuler(a);

  camera.position.set(eye[0], eye[1], eye[2]);
  camera.updateMatrix();
  camera.updateWorldMatrix(true, true);

  renderer.render(state.scene, camera);
}
requestAnimationFrame(loop);

setInterval(() => {
  if (state.session) {
    sendMessage(msg.bodyState(state.session.body));
  }
}, 50);

map.on('click', (ev: any) => {
  console.log(projectGeoToMap(ev.lngLat));
});
