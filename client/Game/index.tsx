import * as React from 'react';
import * as quat from '@2gis/gl-matrix/quat';
import * as vec3 from '@2gis/gl-matrix/vec3';
import { projectMapToGeo, heightToZoom } from '@2gis/jakarta/dist/es6/utils/geo';
import { Map, config, MapOptions } from '@2gis/jakarta';
import { msg, AnyClientMsg } from '../messages';
import { AnyServerMsg } from '../../server/messages';
import { message } from '../reducers';
import { createState } from '../state';
import { degToRad } from '../utils';
import { tick } from '../reducers/tick';
import { processPressedkeys } from '../reducers/actions';

declare const THREE: any;

export class Game extends React.Component<any, any> {
  public map: any;
  public overlay: any;

  constructor(props: any) {
    super(props);

    this.map = null;
    this.overlay = null;
  }

  public componentDidMount() {
    const state = createState(Date.now());

    const ws = new WebSocket(`ws://${location.hostname}:3002/`);

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

    const container = this.map as HTMLElement;
    const options: Partial<MapOptions> = {
      tileSearchNumber: 3,
      center: [82.920412, 55.030111],
      zoom: 17,
      sendAnalytics: false,
      fontUrl: './assets/fonts',
    };
    const map = ((window as any).map = new Map(container, options));
    config.render.alwaysRerender = true;

    const pressedKeys: { [key: string]: boolean } = {};

    window.addEventListener('keydown', (ev) => {
      pressedKeys[ev.code] = true;
    });

    window.addEventListener('keyup', (ev) => {
      pressedKeys[ev.code] = false;
    });

    const leftButton = document.getElementById('left') as HTMLElement;
    leftButton.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      pressedKeys['KeyA'] = true;
    });
    leftButton.addEventListener('touchend', (ev) => {
      ev.preventDefault();
      pressedKeys['KeyA'] = false;
    });

    const rightButton = document.getElementById('right') as HTMLElement;
    rightButton.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      pressedKeys['KeyD'] = true;
    });
    rightButton.addEventListener('touchend', (ev) => {
      ev.preventDefault();
      pressedKeys['KeyD'] = false;
    });

    const upButton = document.getElementById('up') as HTMLElement;
    upButton.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      pressedKeys['KeyS'] = true;
    });
    upButton.addEventListener('touchend', (ev) => {
      ev.preventDefault();
      pressedKeys['KeyS'] = false;
    });

    const downButton = document.getElementById('down') as HTMLElement;
    downButton.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      pressedKeys['KeyW'] = true;
    });
    downButton.addEventListener('touchend', (ev) => {
      ev.preventDefault();
      pressedKeys['KeyW'] = false;
    });

    const fullscreenButton = document.getElementById('fullscreen') as HTMLElement;
    fullscreenButton.addEventListener('click', () => {
      document.body.requestFullscreen();
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
      canvas: this.overlay as HTMLCanvasElement,
      alpha: true,
      antialias: true,
    });

    const onResize = () => {
      map.invalidateSize();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', onResize);
    onResize();

    const cameraRotation = [0, 0, 0, 1];
    const eye = [0, 0, 0];

    function loop() {
      requestAnimationFrame(loop);
      if (!state.session) {
        return;
      }

      const time = Date.now();

      processPressedkeys(time - state.time, state, pressedKeys);

      tick(state, time);

      const body = state.session.body;

      quat.rotateX(cameraRotation, body.rotation, degToRad(70));
      map.setQuat(cameraRotation);

      map.setCenter(projectMapToGeo(body.position), { animate: false });
      map.setZoom(heightToZoom(body.position[2], [window.innerWidth, window.innerHeight]), {
        animate: false,
      });

      const shift = [0, 3000, 15000];
      vec3.transformQuat(shift, shift, cameraRotation);
      vec3.add(eye, body.position, shift);

      const threeQuaternion = new THREE.Quaternion(
        cameraRotation[0],
        cameraRotation[1],
        cameraRotation[2],
        cameraRotation[3],
      );
      camera.setRotationFromQuaternion(threeQuaternion);
      camera.position.set(eye[0], eye[1], eye[2]);
      camera.updateMatrix();
      camera.updateWorldMatrix(true, true);

      renderer.render(state.scene, camera);
    }
    requestAnimationFrame(loop);

    setInterval(() => {
      if (state.session) {
        sendMessage(msg.changes(state.session, state.weapon));

        // Сбрасываем попадания после отправки на сервер
        state.weapon.hits = [];
      }
    }, 50);
  }

  public render() {
    return (
      <React.Fragment>
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
          ref={(map) => {
            this.map = map;
          }}
        />
        <canvas
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
          ref={(overlay) => {
            this.overlay = overlay;
          }}
        />
      </React.Fragment>
    );
  }
}
