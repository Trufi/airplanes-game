import * as React from 'react';
import { State } from '../types';
import { PlayerLabel } from './playerLabel';
import { Debug } from './debug';
import { Aim } from './aim';
import { FireButton } from './fireButton';

interface Props {
  state: State;
}

const projScreenMatrix = new THREE.Matrix4();
const position = new THREE.Vector3();

export class Root extends React.Component<Props, any> {
  public render() {
    const {
      state: { players, bodies, camera, session },
    } = this.props;

    if (!session) {
      return null;
    }

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

    return (
      <div>
        <Debug
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          state={this.props.state}
        />
        {playerNames}
        <Aim position={session.body.position} rotation={session.body.rotation} camera={camera} />
        <FireButton state={this.props.state} />
      </div>
    );
  }
}
