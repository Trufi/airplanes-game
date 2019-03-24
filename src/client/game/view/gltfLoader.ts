export const getGltfLoader = () => {
  return import(/* webpackChunkName: "loader" */ 'three-gltf-loader').then(
    ({ default: Loader }) => {
      return new Loader();
    },
  );
};
