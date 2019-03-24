import * as React from 'react';
import * as THREE from 'three';
import { AppState } from '../types';
import { PlayerLabel } from './playerLabel';
import { DeathNotes } from './DeathNotes';
import { ExecuteCmd } from '../commands/execute';
import { Debug } from './debug';
import { ObserverList } from './observerList';

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

const projScreenMatrix = new THREE.Matrix4();

export class Observer extends React.Component<Props, {}> {
  public render() {
    const {
      appState: { observer, query },
    } = this.props;

    if (!observer) {
      return;
    }

    const { players, bodies, camera } = observer;

    const playerNames: JSX.Element[] = [];

    const frustum = new THREE.Frustum();
    projScreenMatrix.multiplyMatrices(
      camera.object.projectionMatrix,
      camera.object.matrixWorldInverse,
    );
    frustum.setFromMatrix(projScreenMatrix);

    players.forEach(({ id, name, bodyId }) => {
      const targetBody = bodies.get(bodyId);
      if (!targetBody) {
        return;
      }

      playerNames.push(
        <PlayerLabel
          key={id}
          name={name}
          position={targetBody.position}
          camera={camera}
          health={targetBody.health}
          frustum={frustum}
          observer={true}
        />,
      );
    });

    const timeToRestart = observer.restartTime - observer.time;
    const timeLast = observer.serverEndTime + observer.serverTime.diff - observer.time;

    return (
      <div
        style={{
          // https://developers.google.com/web/updates/2017/01/scrolling-intervention
          touchAction: 'none',
        }}
      >
        <DeathNotes state={observer} />
        <div>{playerNames}</div>
        {query.debug && (
          <Debug
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 400,
            }}
            state={observer}
          />
        )}
        {timeToRestart >= 0 && (
          <div style={{ fontSize: '50px' }}>Start at {Math.floor(timeToRestart / 1000)}</div>
        )}
        {timeLast <= 60 * 1000 * 15 && (
          <div style={{ fontSize: '30px' }}>Last time: {Math.floor(timeLast / 1000)}</div>
        )}
        <ObserverList observer={observer} />
      </div>
    );
  }
}
