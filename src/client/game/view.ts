import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import * as vec3 from '@2gis/gl-matrix/vec3';
import { config as mapConfig, MapOptions, Map, Skybox } from '@2gis/jakarta';
import { projectMapToGeo, heightToZoom } from '@2gis/jakarta/dist/es6/utils/geo';
import * as config from '../../config';
import { degToRad } from '../utils';
import { BodyState, CameraState, AnimationPerFrame } from '../types';
import { TextureLoader } from 'three';

mapConfig.camera.fov = 45;
mapConfig.camera.far = 2 ** 32; // Можно оставить 600000, но тогда надо поправить frustum

let renderer: THREE.WebGLRenderer | undefined;
export const createRenderer = () => {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('overlay') as HTMLCanvasElement,
      alpha: true,
      antialias: window.devicePixelRatio < 2,
    });
  }
  return renderer;
};

const gltfLoader = new GLTFLoader();
const textureLoader = new TextureLoader();

export const createMesh = () => {
  const mesh = new THREE.Object3D();
  gltfLoader.load('./assets/new.glb', (gltf) => {
    textureLoader.load('./assets/propeller.jpg', (texture) => {
      const scene = gltf.scene;
      const circleGeom = new THREE.CircleGeometry(config.airplane.propeller.radius, 32);
      const circleMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        opacity: config.airplane.propeller.opacity,
        side: THREE.DoubleSide,
      });
      const circle = new THREE.Mesh(circleGeom, circleMaterial);
      circle.position.set(
        config.airplane.propeller.x,
        config.airplane.propeller.y,
        config.airplane.propeller.z,
      );
      circle.onBeforeRender = (_renderer, _scene, _camera, geometry) => {
        geometry.rotateZ(0.07);
      };

      scene.add(circle);

      // размер соответсвует примерно 50 метрам!
      scene.scale.set(config.airplane.scale, config.airplane.scale, config.airplane.scale);
      scene.rotateX(config.airplane.initRotation.x);
      scene.rotateY(config.airplane.initRotation.y);
      scene.rotateZ(config.airplane.initRotation.z);

      mesh.add(scene);
    });
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
  const q1 = new THREE.Quaternion();
  q1.fromArray(body.rotation);
  mesh.setRotationFromQuaternion(q1);
  mesh.rotateY(-velocityDirection[2] * 1500);
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

export const createBulletMesh = (offsetXDirection: number) => {
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
  mesh.position.setX(config.weapon.bullet.offset.x * offsetXDirection);
  mesh.position.setZ(config.weapon.bullet.offset.z);
  mesh.position.setY(config.weapon.bullet.offset.y);
  mesh.visible = false;
  return mesh;
};

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

const showHideBulletAnimation = (animation: AnimationPerFrame, mesh: THREE.Object3D) => {
  if (animation.is_running) {
    animation.frames += 1;
    if (animation.frames < config.weapon.animationDuration) {
      mesh.visible = true;
    } else if (animation.frames > config.weapon.animationCooldown) {
      animation.frames = 0;
    } else if (animation.frames > config.weapon.animationDuration) {
      mesh.visible = false;
    }
  } else {
    animation.frames = 0;
    mesh.visible = false;
  }
};

export const updateBullet = (mesh: THREE.Line, body: BodyState) => {
  showHideBulletAnimation(body.weapon.animation, mesh);
};

let jakartaMap: Map | undefined;

export const createMap = () => {
  // Если карта уже была создана, то второй раз не создаем
  if (jakartaMap) {
    return jakartaMap;
  }

  const container = document.getElementById('map') as HTMLElement;
  const options: Partial<MapOptions> = {
    center: [82.920412, 55.030111],
    zoom: 17,
    sendAnalytics: false,
    fontUrl: './assets/fonts',
    floorsEnabled: false,
  };
  const map = (jakartaMap = (window as any).map = new Map(container, options));
  mapConfig.render.alwaysRerender = true;

  const skyImage = document.createElement('img');
  skyImage.onload = () => {
    const skybox = new Skybox(skyImage);
    skybox.addTo(map);
  };
  skyImage.src = './assets/skybox3.jpg';

  return map;
};

export const createCamera = (): CameraState => {
  const object = new THREE.PerspectiveCamera(
    mapConfig.camera.fov,
    window.innerWidth / window.innerHeight,
    mapConfig.camera.near,
    mapConfig.camera.far,
  );
  object.position.z = 1;
  object.up.set(0, 0, 1);
  object.lookAt(0, 0, 0);

  return {
    object,
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
  };
};

const mapBodyPosition = [0, 0, 0];
export const updateCameraAndMap = (state: { map: Map; origin: number[]; camera: CameraState }) => {
  const { map, origin, camera } = state;

  map.setQuat(camera.rotation);

  vec3.add(mapBodyPosition, camera.position, origin);
  map.setCenter(projectMapToGeo(mapBodyPosition), { animate: false });
  map.setZoom(heightToZoom(mapBodyPosition[2], [window.innerWidth, window.innerHeight]), {
    animate: false,
  });

  camera.object.quaternion.fromArray(camera.rotation);
  camera.object.position.fromArray(camera.position);
  camera.object.updateMatrix();
  camera.object.updateWorldMatrix(true, true);
};

export const resize = (
  map: Map,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
) => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  map.invalidateSize();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
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
