import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import * as quat from '@2gis/gl-matrix/quat';
import * as vec3 from '@2gis/gl-matrix/vec3';
import { config as mapConfig, MapOptions, Map, Skybox } from '@2gis/jakarta';
import { projectMapToGeo, heightToZoom } from '@2gis/jakarta/dist/es6/utils/geo';
import * as config from '../../config';
import { degToRad } from '../utils';
import { State } from '../types';

mapConfig.camera.fov = 45;

export const createTestMesh = () => {
  const k = 300;

  const cubeGeometry1 = new THREE.BoxGeometry(5 * k, k, k);
  const cubeGeometry2 = new THREE.BoxGeometry(k, 0.5 * k, 4 * k);

  const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff55ff });
  const cube1 = new THREE.Mesh(cubeGeometry1, cubeMaterial);
  const cube2 = new THREE.Mesh(cubeGeometry2, cubeMaterial);

  cube1.rotation.set(Math.PI / 2, Math.PI / 2, 0);
  cube2.rotation.set(Math.PI / 2, Math.PI / 2, 0);
  cube2.position.y = k;

  const cube = new THREE.Object3D();
  cube.add(cube1);
  cube.add(cube2);

  return cube;
};

export const createMesh = () => {
  const mesh = new THREE.Object3D();
  mesh.rotateY(Math.PI / 2);
  mesh.updateMatrix(); // todo убрать
  mesh.updateWorldMatrix(true, true);
  const loader = new GLTFLoader();
  loader.load('./assets/a5.glb', (gltf) => {
    const scene = gltf.scene;
    scene.rotateX(Math.PI / 2);
    scene.rotateY(Math.PI / 2);
    const k = 300; // размер соответсвует примерно 50 метрам!
    scene.scale.set(k, k, k);
    mesh.add(scene);
  });

  return mesh;
};

export const updateMesh = (body: {
  mesh: THREE.Object3D;
  position: number[];
  rotation: number[];
  velocityDirection: number[];
}) => {
  const { mesh, position, velocityDirection } = body;
  mesh.position.set(position[0], position[1], position[2]);

  // rotate mesh
  const q1 = new THREE.Quaternion(
    body.rotation[0],
    body.rotation[1],
    body.rotation[2],
    body.rotation[3],
  );
  mesh.setRotationFromQuaternion(q1);
  mesh.rotateY(-velocityDirection[2] * 1500);

  mesh.updateMatrix();
  mesh.updateWorldMatrix(true, true);
};

export const createScene = () => {
  const scene = new THREE.Scene();

  const light = new THREE.AmbientLight(0x404040);
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 0, 1);
  scene.add(directionalLight);

  return scene;
};

export const createShotMesh = () => {
  const geometry = new THREE.CylinderGeometry(
    config.weapon.radius,
    config.weapon.radius + config.weapon.distance * Math.atan(degToRad(config.weapon.hitAngle)),
    config.weapon.distance,
    9,
  );

  const material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
  material.transparent = true;
  material.opacity = 0.5;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotateZ(Math.PI);
  mesh.position.y = config.weapon.distance / 2;
  mesh.visible = false;
  return mesh;
};

export const createBulletMesh = (offsetX: number) => {
  const material = new THREE.LineBasicMaterial({ 
    color: config.weapon.bullet.color, 
    linewidth: config.weapon.bullet.width,
    opacity: config.weapon.bullet.opacity,
  });
  const geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, config.weapon.distance, 0),
  );
  const mesh = new THREE.Line(geometry, material);
  mesh.position.x = config.weapon.bullet.offset.x * offsetX;
  mesh.position.z = config.weapon.bullet.offset.z;
  mesh.position.y = config.weapon.bullet.offset.y;
  mesh.visible = false;
  return mesh;
}

export const updateShot = (
  time: number,
  shotMesh: THREE.Object3D,
  weapon: { lastShotTime: number },
) => {
  if (time - weapon.lastShotTime < config.weapon.cooldown) {
    shotMesh.visible = true;
  } else {
    shotMesh.visible = false;
  }
};

export const updateBullet = (
  time: number,
  mesh: THREE.Object3D,
  weapon: { lastShotTime: number },
) => {
  if (time - weapon.lastShotTime < config.weapon.animationDuration) {
    mesh.visible = true;
  } else {
    mesh.visible = false;
  }
};

export const createMap = () => {
  const container = document.getElementById('map') as HTMLElement;
  const options: Partial<MapOptions> = {
    tileSearchNumber: 3,
    drawDistance: 450000,
    fogSoftness: 0.5,
    center: [82.920412, 55.030111],
    zoom: 17,
    sendAnalytics: false,
    fontUrl: './assets/fonts',
    floorsEnabled: false,
  };
  const map = ((window as any).map = new Map(container, options));
  mapConfig.render.alwaysRerender = true;

  const skyImage = document.createElement('img');
  skyImage.onload = () => {
    const skybox = new Skybox(skyImage);
    skybox.addTo(map);
  };
  skyImage.src = './assets/skybox1.jpg';

  return map;
};

export const createCamera = () => {
  const camera = new THREE.PerspectiveCamera(
    mapConfig.camera.fov,
    window.innerWidth / window.innerHeight,
    mapConfig.camera.near,
    mapConfig.camera.far,
  );
  camera.position.z = 1;
  camera.up.set(0, 0, 1);
  camera.lookAt(0, 0, 0);
  return camera;
};

const cameraRotation = [0, 0, 0, 1];
const mapBodyPosition = [0, 0, 0];
const eye = [0, 0, 0];

export const updateCameraAndMap = (state: State) => {
  const {
    map,
    body: { rotation, position },
    origin,
    camera,
  } = state;

  vec3.add(mapBodyPosition, position, origin);

  quat.rotateX(cameraRotation, rotation, degToRad(100));
  map.setQuat(cameraRotation);

  map.setCenter(projectMapToGeo(mapBodyPosition), { animate: false });
  map.setZoom(heightToZoom(mapBodyPosition[2], [window.innerWidth, window.innerHeight]), {
    animate: false,
  });

  // Отодвигаем камеру от самолета
  const shift = [0, 4500, 15000];
  vec3.transformQuat(shift, shift, cameraRotation);
  vec3.add(eye, mapBodyPosition, shift);

  // Вычитаем центр координат для увеличения точности
  vec3.sub(eye, eye, origin);

  camera.quaternion.fromArray(cameraRotation);
  camera.position.fromArray(eye);
  camera.updateMatrix();
  camera.updateWorldMatrix(true, true);
};

export const createText = (text: string) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const fontSize = 300;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.font = `${fontSize}px serif`;

  const textMetrics = ctx.measureText(text);
  canvas.width = textMetrics.width;
  canvas.height = fontSize;

  ctx.fillStyle = '#ff0000';
  ctx.font = `${fontSize}px monospace`;
  ctx.fillText(text, 0, fontSize);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  texture.generateMipmaps = false;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1500, 1500, 1);
  sprite.position.z += 3000;

  return sprite;
};
