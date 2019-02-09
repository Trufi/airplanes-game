import { setEyePosition, radToDeg } from '@2gis/jakarta/dist/es6/utils/common';
import { projectMapToGeo, projectGeoToMap, heightToZoom } from '@2gis/jakarta/dist/es6/utils/geo';
import 'three/examples/js/loaders/GLTFLoader';
import { Map, config } from '@2gis/jakarta';
import { AirplaneBody } from '../physic/airplane';
import { angle, degToRad } from '../physic/utils';

declare const THREE: any;

const container = document.getElementById('map') as HTMLElement;
const host = window.document.location.host.replace(/:.*/, '');

const client = new Colyseus.Client(location.protocol.replace('http', 'ws') + host + ':' + 2567);
const room = client.join('state_handler');

const players: any = {};
const colors: string[] = ['red', 'green', 'yellow', 'blue', 'cyan', 'magenta'];

const scene = new THREE.Scene();

const rollSpeed = 0.001;
const rollComebackSpeed = 0.0002;
const pitchSpeed = 0.001;
const velocity = 40;
const k = 300; // размер соответсвует примерно 50 метрам!

const height = 80000;

const body = new AirplaneBody();

const mapPoint = projectGeoToMap([82.920412, 55.030111]);
body.position[0] = mapPoint[0];
body.position[1] = mapPoint[1];

const options = {
  center: projectMapToGeo(body.position),
  zoom: heightToZoom(height + 25000, [window.innerWidth, window.innerHeight]),
  sendAnalytics: false,
  fontUrl: './dist/assets/fonts',
};
const map = ((window as any).map = new Map(container, options));

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

const mesh = new THREE.Object3D();
mesh.scale.set(k, k, k);
mesh.rotateY(Math.PI / 2);
mesh.updateMatrix();
mesh.updateWorldMatrix(true, true);

// listen to patches coming from the server
room.listen('players/:id', (change: any) => {
  if (change.operation === 'add') {
    // const dom = document.createElement("div");
    // dom.className = "player";
    // dom.style.left = change.value.x + "px";
    // dom.style.top = change.value.y + "px";
    // dom.style.background = colors[Math.floor(Math.random() * colors.length)];
    // dom.innerHTML = "Player " + change.path.id;
    //
    // document.body.appendChild(dom);

    const loader = new THREE.GLTFLoader();
    loader.load('./assets/a5.glb', (gltf: any) => {
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

    console.log('ADDED PLAYER', change);

    players[change.path.id] = {
      change,
      x: change.value.x,
      y: change.value.y,
      mesh: 0,
    };
  } else if (change.operation === 'remove') {
    // document.body.removeChild(players[ change.path.id ]);
    delete players[change.path.id];
    console.log('REMOVE PLAYER', change, players);
  }
});

room.listen('players/:id/:axis', (change: any) => {
  console.log('CHANGE AXIS PLAYER', change);
  // const dom = players[ change.path.id ];
  //
  // const styleAttribute = (change.path.axis === "x")
  //     ? "left"
  //     : "top";
  //
  // dom.style[ styleAttribute ] = change.value + "px";
  const player = { ...players[change.path.id] };

  switch (change.path.axis) {
    case 'x': {
      player.x = change.value;
    }
    case 'y': {
      player.y = change.value;
    }
  }
  players[change.path.id] = {
    ...player,
  };

  console.log('players', players);
});

function up() {
  room.send({y: -1});
}

function right() {
  room.send({x: 1});
}

function down() {
  room.send({y: 1});
}

function left() {
  room.send({x: -1});
}

declare const THREE: any;
// declare const J: any;

const container = document.getElementById('map') as HTMLElement;

const position = projectGeoToMap([82.920412, 55.030111]);
position[2] = 80000;

const minZoom = 12;
const maxZoom = 22; // heightToZoom(position[2] + 5000, [window.innerWidth, window.innerHeight]);

// const maxVelocity = 30;
// const minVelocity = 10;

// const acceleration = 0.05;
let rotation = 0;
let roll = 0;
let pitch = 0;

const options = {
  center: projectMapToGeo(position),
  zoom: 17,
  minZoom,
  maxZoom,
  minPitch: 0,
  maxPitch: 0,
  sendAnalytics: false,
  fontUrl: './dist/fonts',
};
const map = ((window as any).map = new Map(container, options));

window.addEventListener('resize', () => map.invalidateSize());

let lastTime = Date.now();

const currentDownKeys: { [key: string]: boolean } = {};

window.addEventListener('keydown', (ev) => {
  currentDownKeys[ev.code] = true;
});

window.addEventListener('keyup', (ev) => {
  currentDownKeys[ev.code] = false;
});

// const geometry = new THREE.BoxGeometry(k, k, k);
// const material = new THREE.MeshNormalMaterial();

// const mesh = new THREE.Mesh(geometry, material);

// @TODO перенес в ADD PLAYER
// const mesh = new THREE.Object3D();
// mesh.scale.set(k, k, k);
// mesh.rotateY(Math.PI / 2);
// mesh.updateMatrix();
// mesh.updateWorldMatrix(true, true);
//
// const loader = new THREE.GLTFLoader();
// loader.load('./assets/a5.glb', (gltf: any) => {
//   const scene = gltf.scene;
//   console.log(gltf);
//   // scene.children[0].rotateX(-Math.PI / 2);
//   // scene.children[0].updateMatrix();
//   // scene.children[0].updateWorldMatrix();
//   // scene.children[0].material = material;
//   // mesh.add(scene.children[1]);
//
//   scene.rotateX(Math.PI / 2);
//   scene.rotateY(Math.PI / 2);
//   // scene.updateMatrix();
//   // scene.updateWorldMatrix();
//   mesh.add(scene);
// });
//
// scene.add(mesh);
//
// const light = new THREE.AmbientLight(0x404040);
// scene.add(light);
//
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
// directionalLight.position.set(0, 0, 1);
// scene.add(directionalLight);

// const up = new THREE.Vector3(0, 0, 1);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('overlay') as HTMLCanvasElement,
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

function loop() {
  requestAnimationFrame(loop);

  const now = Date.now();
  const delta = now - lastTime;

  let rollPressed = false;

  for (const code in currentDownKeys) {
    if (!currentDownKeys[code]) {
      continue;
    }

    switch (code) {
      case 'KeyA':
        left();
        body.rollLeft(delta);
        rollPressed = true;
        break;
      case 'KeyD':
        right();
        body.rollRight(delta);
        rollPressed = true;
        break;
    }
  }

  if (!rollPressed) {
    body.restoreRoll(delta);
  }

  body.tick(delta);

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

  mesh.position.set(body.position[0], body.position[1], height);

  // rotate mesh
  const q1 = new THREE.Quaternion();
  mesh.setRotationFromQuaternion(q1);
  mesh.rotateZ(rotation - Math.PI / 2);
  mesh.updateMatrix();
  mesh.updateWorldMatrix(true, true);

  renderer.render(scene, camera);

  lastTime = now;
}
requestAnimationFrame(loop);

map.on('click', (ev: any) => {
  console.log(projectGeoToMap(ev.lngLat));
});
