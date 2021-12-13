import * as vec3 from '@2gis/gl-matrix/vec3';
import * as config from '../../../config';
import { CameraState } from '../../types';

let map: import('@webmaps/jakarta').Map | undefined;
let jakartaModule: typeof import('@webmaps/jakarta') | undefined;

export const initMap = () => {
  if (map) {
    return;
  }

  import(/* webpackChunkName: "map" */ '@webmaps/jakarta').then((jakarta) => {
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
      tileServer: 'tile{subdomain}-sdk.maps.2gis.com',
      key: '042b5b75-f847-4f2a-b695-b5f58adc9dfd',
      sessionId: uuid(),
    };
    map = (window as any).map = new Map(container, options);

    const skyImage = document.createElement('img');
    skyImage.onload = () => {
      if (map) {
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

const uuid = () => {
  let ret = '';
  let value: number;
  for (let i = 0; i < 32; i++) {
    value = (Math.random() * 16) | 0;

    // Insert the hypens
    if (i > 4 && i < 21 && !(i % 4)) {
      ret += '-';
    }

    // Add the next random character
    ret += (i === 12 ? 4 : i === 16 ? (value & 3) | 8 : value).toString(16);
  }
  return ret;
};
