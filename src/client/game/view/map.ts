import * as vec3 from '@2gis/gl-matrix/vec3';
import * as config from '../../../config';
import { CameraState } from '../../types';

let map: any | undefined;
let jakartaModule: any | undefined;

export const initMap = () => {
  if (map) {
    return;
  }

  import(/* webpackChunkName: "map" */ '../../jakarta/jakarta.js').then((jakarta) => {
    jakartaModule = jakarta;

    const { Map, Skybox, config: mapConfig } = jakarta;

    mapConfig.camera.fov = config.camera.fov;
    mapConfig.camera.far = config.camera.far;
    mapConfig.camera.near = config.camera.near;

    const container = document.getElementById('map') as HTMLElement;
    const options = {
      center: [82.920412, 55.030111],
      zoom: 17,
      sendAnalytics: false,
      floorsEnabled: false,
      tileServer: config.tilesUrl,

      // The style was copied from the style with ID 'c6b98f58-6754-4103-b85e-cca497050d7a'
      style: '/assets/style',
      styleOptions: {
        iconsPath: '/icons',
        fontsPath: '/fonts',
      },
    };
    map = (window as any).map = new Map(container, options);

    const skyImage = document.createElement('img');
    skyImage.onload = () => {
      if (map) {
        // tslint:disable-next-line: no-unused-expression
        new Skybox(map, skyImage);
      }
    };
    skyImage.src = './assets/skybox3.jpg';
  });
};

const mapBodyPosition = [0, 0, 0];
export const updateMap = (state: { origin: number[]; camera: CameraState }) => {
  if (!map || !jakartaModule) {
    return;
  }
  const { origin, camera } = state;
  const {
    utilsGeo: { projectMapToGeo, heightToZoom },
  } = jakartaModule;
  map.setQuat(camera.rotation);

  vec3.add(mapBodyPosition, camera.position, origin);
  map.setCenter(projectMapToGeo(mapBodyPosition), { animate: false });
  map.setZoom(heightToZoom(mapBodyPosition[2], [window.innerWidth, window.innerHeight]), {
    animate: false,
  });
};

export const invalidateMapSize = () => {
  if (map) {
    map.invalidateSize();
  }
};
