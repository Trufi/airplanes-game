import * as React from 'react';
import { Login } from './Login';
import { GameSelect } from './GameSelect';
import { ExecuteCmd } from '../commands/execute';
import { AppState } from '../types';
import { Game } from './Game';
import { appState } from '../appState';
import { Observer } from './observer';
import { Connection } from './Connection';

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

export class Root extends React.Component<Props, {}> {
  public render() {
    const {
      appState: { type, game, name, observer, tryJoin },
      executeCmd,
    } = this.props;

    if (type === 'game' && game) {
      return <Game appState={appState} executeCmd={executeCmd} />;
    }

    if (type === 'observer' && observer) {
      return <Observer appState={appState} executeCmd={executeCmd} />;
    }

    if (type === 'login' && !name) {
      return <Login appState={appState} executeCmd={executeCmd} />;
    }

    if (type === 'gameSelect') {
      if (!tryJoin) {
        return <GameSelect appState={appState} executeCmd={executeCmd} />;
      } else {
        return <Connection />;
      }
    }
  }
}
