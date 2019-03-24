import * as React from 'react';
import * as THREE from 'three';
import { AppState, State, PhysicBodyState } from '../../types';
import { PlayerLabel } from '../playerLabel';
import { Debug } from '../debug';
import { Aim } from '../aim';
import { FireButton } from '../FireButton';
import { DeathNotes } from '../DeathNotes';
import { Stick } from '../Stick';
import { ExecuteCmd, executeCmd } from '../../commands/execute';
import { cmd } from '../../commands';
import { msg } from '../../messages/index';
import { Arrow } from '../arrow';
import { Health } from '../Health';
import { BoostButton } from '../BoostButton';
import { ShotBlink } from '../shotBlink/shotBlink';
import { DamageIndicator } from '../damageIndicator/damageIndicator';
import { Disconnect } from '../disconnect';
import styles from './index.css';
import { DeathScreen } from './DeathScreen';
interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

const projScreenMatrix = new THREE.Matrix4();

export class Game extends React.Component<Props, {}> {
  public render() {
    const {
      appState: { game, connected },
    } = this.props;

    if (!game) {
      return;
    }

    if (!connected) {
      return <Disconnect />;
    }

    const { players, bodies, camera, body } = game;

    const playerNames: JSX.Element[] = [];
    const playerArrows: JSX.Element[] = [];

    const frustum = new THREE.Frustum();
    projScreenMatrix.multiplyMatrices(
      camera.object.projectionMatrix,
      camera.object.matrixWorldInverse,
    );
    frustum.setFromMatrix(projScreenMatrix);

    players.forEach(({ id, name, bodyId }) => {
      const targetBody = bodies.get(bodyId);

      // Не показываем подпись на своим самолетом
      if (!targetBody || targetBody === body) {
        return;
      }

      playerArrows.push(
        <Arrow key={id} position={targetBody.position} camera={camera} frustum={frustum} />,
      );

      playerNames.push(
        <PlayerLabel
          key={id}
          name={name}
          position={targetBody.position}
          camera={camera}
          health={targetBody.health}
          frustum={frustum}
        />,
      );
    });

    const timeToRestart = game.restartTime - game.time;
    const timeLast = game.serverEndTime + game.serverTime.diff - game.time;

    return (
      <div
        style={{
          // https://developers.google.com/web/updates/2017/01/scrolling-intervention
          touchAction: 'none',
        }}
      >
        <div className={styles.deathNotesWrapper}>
          <DeathNotes state={game} />
        </div>
        <div>{playerNames}</div>
        <div>{playerArrows}</div>
        {timeToRestart >= 0 && (
          <div style={{ fontSize: '50px' }}>Start at {Math.floor(timeToRestart / 1000)}</div>
        )}
        {timeLast <= 60 * 1000 * 15 && (
          <div style={{ fontSize: '30px' }}>Last time: {Math.floor(timeLast / 1000)}</div>
        )}
        {body ? (
          this.renderLiveComponents(game, body)
        ) : (
          <DeathScreen game={game} restart={this.restart} />
        )}
      </div>
    );
  }

  private renderLiveComponents(game: State, body: PhysicBodyState) {
    return (
      <>
        <ShotBlink game={game} />
        <DamageIndicator game={game} />
        <Aim weapon={body.weapon} time={game.time} />
        <div className={styles.controllers}>
          <BoostButton game={game} />
          <FireButton game={game} />
        </div>
        <Stick state={game} />
        {this.props.appState.query.debug && (
          <Debug
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 400,
            }}
            state={game}
          />
        )}
        <Health body={body} />
      </>
    );
  }

  private restart = () => {
    executeCmd(cmd.sendMsg(msg.restart()));
  };
}
