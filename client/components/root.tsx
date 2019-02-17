import * as React from 'react';
import { State } from '../types';
import { PlayerLabel } from './playerLabel';

interface Props {
  state: State;
}

const projScreenMatrix = new THREE.Matrix4();
const position = new THREE.Vector3();

export class Root extends React.Component<Props, any> {
  public render() {
    const {
      state: { players, bodies, camera },
    } = this.props;

    const playerNames: JSX.Element[] = [];

    const frustum = new THREE.Frustum();
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromMatrix(projScreenMatrix);

    players.forEach(({ id, name, bodyId }) => {
      const body = bodies.get(bodyId);
      if (!body) {
        return;
      }

      position.fromArray(body.position);

      if (!frustum.containsPoint(position)) {
        return;
      }

      playerNames.push(
        <PlayerLabel
          key={id}
          name={name}
          position={body.position}
          camera={camera}
          health={body.health}
        />,
      );
    });

    return <div>{playerNames}</div>;
  }
}
