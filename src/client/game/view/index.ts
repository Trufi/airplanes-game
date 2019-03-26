import * as THREE from 'three';
import * as config from '../../../config';
import { degToRad } from '../../utils';
import { BodyState, CameraState, NonPhysicBodyState, PhysicBodyState } from '../../types';
import { updateAnimation } from '../animations';
import { initMap, updateMap, invalidateMapSize } from './map';
import { getGltfLoader } from './gltfLoader';
import { HealPoint } from '../actions/healPoints';

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

const textureLoader = new THREE.TextureLoader();
const airplane_palettes = [
  [
    {
      color: new THREE.Color(0xcc0000),
      names: ['Закрылки', 'Закрылки_хвостовые', 'КрышкаНоса002', 'Дуло', 'Хвост005'],
    },
    { color: new THREE.Color(0x00cc00), names: ['Корпус', 'Крылья', 'Крылья_хвостовые', 'Нос007'] },
    {
      color: new THREE.Color(0x0000cc),
      names: ['Пулеметы', 'Кабина002', 'Колено001', 'Ноги001', 'Пимпа002', 'Cylinder8283'],
    },
  ],
  [
    {
      color: new THREE.Color(0x0000cc),
      names: ['Закрылки', 'Закрылки_хвостовые', 'КрышкаНоса002', 'Дуло', 'Хвост005'],
    },
    { color: new THREE.Color(0xcc0000), names: ['Корпус', 'Крылья', 'Крылья_хвостовые', 'Нос007'] },
    {
      color: new THREE.Color(0x00cc00),
      names: ['Пулеметы', 'Кабина002', 'Колено001', 'Ноги001', 'Пимпа002', 'Cylinder8283'],
    },
  ],
];
const group_apply = (group: any, model: THREE.Object3D) => {
  group.names.forEach((name: string) => {
    const child = model.getObjectByName(name) as THREE.Mesh | undefined;
    if (child && child.material instanceof THREE.MeshStandardMaterial) {
      const newMaterial = child.material.clone();
      newMaterial.color = group.color;
      child.material = newMaterial;
    }
  });
};

export const createMesh = (id: number) => {
  const mesh = new THREE.Object3D();
  const paletteId = id % airplane_palettes.length;

  getGltfLoader().then((loader) =>
    loader.load('./assets/new.glb', (gltf) => {
      const scene = gltf.scene;
      const airplane_model = scene.getObjectByName('Самолет');
      if (airplane_model) {
        airplane_palettes[paletteId].forEach((group) => {
          group_apply(group, airplane_model);
        });

        textureLoader.load('./assets/propeller.jpg', (texture) => {
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

          airplane_model.add(circle);
        });

        // размер соответсвует примерно 50 метрам!
        airplane_model.scale.set(
          config.airplane.scale,
          config.airplane.scale,
          config.airplane.scale,
        );
        airplane_model.rotateX(config.airplane.initRotation.x);
        airplane_model.rotateY(config.airplane.initRotation.y);
        airplane_model.rotateZ(config.airplane.initRotation.z);

        scene.add(airplane_model);
        mesh.add(scene);
      }
    }),
  );

  return mesh;
};

/**
 * Обновление меша интерполируемого тела
 */
export const updateNonPhysicMesh = (body: NonPhysicBodyState) => {
  const { mesh, position, rotation } = body;
  mesh.position.fromArray(position);
  mesh.quaternion.fromArray(rotation);
};

/**
 * Обновление меша тела, физика которого эмулируется на клиент
 * Разница с `updateNonPhysicMesh` в том, что тут еще добавляет вращение
 * относительно угловой скорости
 */
export const updatePhysicMesh = (body: PhysicBodyState) => {
  const { mesh, position, rotation, velocityDirection } = body;
  mesh.position.fromArray(position);
  mesh.quaternion.fromArray(rotation);
  // Добавляем вращение относительно угловой скорости
  mesh.rotateY(-velocityDirection[2] * config.airplane.yRotationFactor);
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
  const meshGroup = new THREE.Group();
  const lineMat = new THREE.MeshBasicMaterial({
    color: config.weapon.bullet.color.line,
    opacity: config.weapon.bullet.opacity,
  });
  const flashMat = new THREE.MeshBasicMaterial({
    color: config.weapon.bullet.color.flash,
    opacity: config.weapon.bullet.opacity,
  });

  const bg = new THREE.CylinderGeometry(10, 100, config.weapon.distance);
  const line = new THREE.Mesh(bg, lineMat);
  line.position.setY(config.weapon.distance / 2);

  const sg = new THREE.SphereGeometry(300, 32, 32);
  const sphere = new THREE.Mesh(sg, flashMat);

  meshGroup.add(line);
  meshGroup.add(sphere);

  meshGroup.position.setX(config.weapon.bullet.offset.x * offsetXDirection);
  meshGroup.position.setZ(config.weapon.bullet.offset.z);
  meshGroup.position.setY(config.weapon.bullet.offset.y);

  return meshGroup;
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

export const updateBullet = (bulletObject: THREE.Group, body: BodyState) => {
  updateAnimation(body.weapon.animation, bulletObject);
};

export const createMap = () => {
  initMap();
};

export const createCamera = (): CameraState => {
  const object = new THREE.PerspectiveCamera(
    config.camera.fov,
    window.innerWidth / window.innerHeight,
    config.camera.near,
    config.camera.far,
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

export const updateCameraAndMap = (state: { origin: number[]; camera: CameraState }) => {
  const { camera } = state;

  updateMap(state);

  camera.object.quaternion.fromArray(camera.rotation);
  camera.object.position.fromArray(camera.position);
  camera.object.updateMatrix();
  camera.object.updateWorldMatrix(true, true);
};

export const resize = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  invalidateMapSize();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

const healPointMaterial = new THREE.MeshLambertMaterial({
  color: 0x66b1ff,
  transparent: true,
  opacity: 0.3,
});
healPointMaterial.emissive = new THREE.Color(0xffffff);
const healPointGeometry = new THREE.SphereGeometry(config.healPoints.radius, 20, 20);

const healSpriteMap = textureLoader.load('./assets/heal.png');
const healSpriteMaterial = new THREE.SpriteMaterial({
  map: healSpriteMap,
  color: 0xffffff,
  transparent: true,
  opacity: 0.5,
});

export const createHealPointMesh = (position: number[]) => {
  const object = new THREE.Object3D();
  object.position.set(position[0], position[1], position[2]);
  const mesh = new THREE.Mesh(healPointGeometry, healPointMaterial);
  mesh.renderOrder = 1;
  const sprite = new THREE.Sprite(healSpriteMaterial);
  sprite.scale.set(15000, 15000, 1);
  object.add(sprite);
  object.add(mesh);
  return object;
};

export const updateHealPointMesh = (healPoint: HealPoint) => {
  const { live, mesh } = healPoint;
  mesh.visible = live;
};
