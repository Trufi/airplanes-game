import { Map, config } from '@2gis/jakarta';
import { setEyePosition, radToDeg } from '@2gis/jakarta/src/utils/common';
import { projectMapToGeo, projectGeoToMap, heightToZoom } from '@2gis/jakarta/src/utils/geo';
import * as mat4 from '@2gis/gl-matrix/mat4';
import * as vec3 from '@2gis/gl-matrix/vec3';
import 'three/examples/js/loaders/GLTFLoader';

declare const window: any;
declare const J: any;
declare const THREE: any;

const container = document.getElementById('map') as HTMLElement;

const position = projectGeoToMap([82.920412, 55.030111]);
position[2] = 80000;

const minZoom = 12;
const maxZoom = 22; // heightToZoom(position[2] + 5000, [window.innerWidth, window.innerHeight]);

// const maxVelocity = 30;
// const minVelocity = 10;

// const acceleration = 0.05;

const velocity = 40;
let rotation = 0;

let roll = 0;
const rollSpeed = 0.001;
const rollComebackSpeed = 0.0002;

let pitch = 0;
const pitchSpeed = 0.001;

const options = {
  center: projectMapToGeo(position),
  zoom: 17,
  minZoom,
  maxZoom,
  minPitch: 0,
  maxPitch: 0,
  sendAnalytics: false,
};
const map = (window.map = new J.Map(container, options) as Map);

window.addEventListener('resize', () => map.invalidateSize());

let lastTime = Date.now();

const currentDownKeys: { [key: string]: boolean } = {};

window.addEventListener('keydown', (ev) => {
  currentDownKeys[ev.code] = true;
});

window.addEventListener('keyup', (ev) => {
  currentDownKeys[ev.code] = false;
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

const scene = new THREE.Scene();

const k = 300; // размер соответсвует примерно 50 метрам!

// const geometry = new THREE.BoxGeometry(k, k, k);
// const material = new THREE.MeshNormalMaterial();

// const mesh = new THREE.Mesh(geometry, material);
const mesh = new THREE.Object3D();
mesh.scale.set(k, k, k);
mesh.rotateY(Math.PI / 2);
mesh.updateMatrix();
mesh.updateWorldMatrix();

const loader = new THREE.GLTFLoader();
loader.load('./assets/a5.glb', (gltf) => {
  const scene = gltf.scene;
  console.log(gltf);
  // scene.children[0].rotateX(-Math.PI / 2);
  // scene.children[0].updateMatrix();
  // scene.children[0].updateWorldMatrix();
  // scene.children[0].material = material;
  // mesh.add(scene.children[1]);

  scene.rotateX(Math.PI / 2);
  scene.rotateY(Math.PI / 2);
  // scene.updateMatrix();
  // scene.updateWorldMatrix();
  mesh.add(scene);
});

scene.add(mesh);

const light = new THREE.AmbientLight(0x404040);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

// const up = new THREE.Vector3(0, 0, 1);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('overlay'),
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.PlaneGeometry(5000, 5000);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
const plane = new THREE.Mesh(geometry, material);
// scene.add(plane);

const m = mat4.create();
const m2 = mat4.create();

function loop() {
  requestAnimationFrame(loop);

  const now = Date.now();
  const delta = now - lastTime;

  let rollPressed = false;
  let pitchPressed = false;

  for (const code in currentDownKeys) {
    if (!currentDownKeys[code]) {
      continue;
    }

    switch (code) {
      case 'KeyA':
        roll = clamp(roll - rollSpeed * delta, -Math.PI / 2, Math.PI / 2);
        rollPressed = true;
        break;
      case 'KeyD':
        roll = clamp(roll + rollSpeed * delta, -Math.PI / 2, Math.PI / 2);
        rollPressed = true;
        break;
      case 'KeyW':
        pitch = pitch - pitchSpeed * delta;
        pitchPressed = true;
        // velocity = clamp(velocity + delta * acceleration, minVelocity, maxVelocity);
        break;
      case 'KeyS':
        pitch = pitch + pitchSpeed * delta;
        pitchPressed = true;
        // velocity = clamp(velocity - delta * acceleration, minVelocity, maxVelocity);
        break;
    }
  }

  if (!rollPressed) {
    if (Math.abs(roll) < rollComebackSpeed * delta) {
      roll = 0;
    } else if (roll > 0) {
      roll = Math.max(0, roll - rollComebackSpeed * delta);
    } else if (roll < 0) {
      roll = Math.min(0, roll + rollComebackSpeed * delta);
    }
  }

  if (!pitchPressed) {
    if (Math.abs(pitch) < pitchSpeed * delta) {
      pitch = 0;
    }
  }

  rotation = rotation - roll * delta * 0.001;

  const step = delta * velocity;

  mat4.identity(m);
  mat4.rotateZ(m, m, rotation);

  mat4.identity(m2);
  mat4.rotateX(m2, m2, pitch);

  mat4.mul(m, m, m2);

  const direction = vec3.fromValues(0, 1, 0);
  vec3.transformMat4(direction, direction, m);
  vec3.scale(direction, direction, step);
  vec3.add(position, position, direction);

  map.setCenter(projectMapToGeo(position), { animate: false });
  map.setRotation(radToDeg(rotation));
  map.setZoom(heightToZoom(position[2] + 25000, [window.innerWidth, window.innerHeight]));

  const eye = [0, 0, 0];
  setEyePosition(eye, map.map.state);

  const a = new THREE.Euler(0, degToRad(map.getPitch()), degToRad(map.getRotation()), 'XYZ');
  camera.setRotationFromEuler(a);

  camera.position.set(eye[0], eye[1], eye[2]);
  camera.updateMatrix();
  camera.updateWorldMatrix();

  mesh.position.set(position[0], position[1], position[2]);

  // rotate mesh
  const q1 = new THREE.Quaternion();

  mesh.setRotationFromQuaternion(q1);

  mesh.rotateZ(rotation);
  mesh.rotateX(pitch);
  mesh.rotateY(roll);

  // q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotation);

  // const q2 = new THREE.Quaternion();
  // q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), roll);

  // const q3 = new THREE.Quaternion();
  // q3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);

  // q1.multiply(q2);
  // q1.multiply(q3);

  // mesh.setRotationFromQuaternion(q1);

  mesh.updateMatrix();
  mesh.updateWorldMatrix();

  plane.position.set(position[0], position[1], 0);

  renderer.render(scene, camera);

  lastTime = now;
}
requestAnimationFrame(loop);

map.on('click', (ev) => {
  console.log(projectGeoToMap(ev.lngLat));
});

function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function clamp(value: number, min: number, max: number): number {
  value = Math.max(value, min);
  value = Math.min(value, max);
  return value;
}
