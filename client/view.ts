import 'three/examples/js/loaders/GLTFLoader';

declare const THREE: any;

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
  const k = 300; // размер соответсвует примерно 50 метрам!
  const mesh = new THREE.Object3D();
  mesh.scale.set(k, k, k);
  mesh.rotateY(Math.PI / 2);
  mesh.updateMatrix(); // todo убрать
  mesh.updateWorldMatrix(true, true);
  const loader = new THREE.GLTFLoader();
  loader.load('./assets/a5.glb', (gltf: any) => {
    const scene = gltf.scene;
    scene.rotateX(Math.PI / 2);
    scene.rotateY(Math.PI / 2);
    mesh.add(scene);
  });

  return mesh;
};

const height = 80000;

export const updateMesh = (body: { mesh: any; position: number[]; quaternion: number[] }) => {
  const { mesh, position } = body;
  mesh.position.set(position[0], position[1], height);

  // rotate mesh
  const q1 = new THREE.Quaternion(
    body.quaternion[0],
    body.quaternion[1],
    body.quaternion[2],
    body.quaternion[3],
  );
  mesh.setRotationFromQuaternion(q1);

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
