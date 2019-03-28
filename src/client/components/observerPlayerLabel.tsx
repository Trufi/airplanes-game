import * as React from 'react';
import * as THREE from 'three';
import { unnormalizeMouse } from '../utils';
import { CameraState } from '../types';

interface Props {
  time: number;
  name: string;
  position: number[];
  camera: CameraState;
  health: number;
  frustum: THREE.Frustum;
}

interface State {
  prevHealth: number;
  startBlinkTime: number;
}

const v = new THREE.Vector3();

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export class ObserverPlayerLabel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      prevHealth: props.health,
      startBlinkTime: 0,
    };
  }

  public componentDidUpdate() {
    if (this.state.prevHealth > this.props.health) {
      this.setState({
        prevHealth: this.props.health,
        startBlinkTime: this.props.time,
      });
    }
  }

  public render() {
    const { name, position, camera, health, frustum, time } = this.props;
    const { startBlinkTime } = this.state;

    v.fromArray(position);

    if (!frustum.containsPoint(v)) {
      return null;
    }

    const color = time - startBlinkTime < 200 ? '#ff0000' : '#000000';

    v.project(camera.object);

    unnormalizeMouse(v, [window.innerWidth, window.innerHeight]);

    const width = 100;
    const height = 40;

    const x = Math.round(v.x - width / 2);
    const y = Math.round(v.y) - height;

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${width}px`,
          transform: `translate3d(${x}px,${y}px,0)`,
          color,
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {capitalizeFirstLetter(name)}
        <br />
        {Math.round(health)} / 100
      </div>
    );
  }
}
