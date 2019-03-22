import * as React from 'react';
import { cmd } from '../../commands';
import { ExecuteCmd } from '../../commands/execute';
import { AppState } from '../../types';
import { getList } from '../../services/game';
import { GamelistResponse } from '../../../mainServer/types/api';
import styles from './index.css';

interface State {
  gamelist: GamelistResponse;
}

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

export class GameSelect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      gamelist: [],
    };
  }

  public componentDidMount() {
    const { appState } = this.props;
    if (appState.token) {
      getList({ token: appState.token }).then((data) => {
        this.setState({ gamelist: data });
      });
    }
  }

  public render() {
    const { gamelist } = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.list}>
          {gamelist.length === 0 ? (
            <div>These aren't the games you're looking for.</div>
          ) : (
            gamelist.map(({ url, type, players, maxPlayers, city }, i) => (
              <div key={i} className={styles.gameItem} onClick={() => this.gameSelected(url)}>
                <div className={styles.itemRounded}>
                  <div>
                    {city} {type} {players}/{maxPlayers}
                  </div>
                </div>
                <div className={styles.obsLink} onClick={(ev) => this.gameObserve(ev, url)}>
                  Observer
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  private gameSelected = (url: string) => {
    this.props.executeCmd(cmd.connectToGameServer(url));

    this.props.appState.tryJoin = {
      url,
      type: 'player',
    };
  };

  private gameObserve = (ev: React.MouseEvent, url: string) => {
    ev.stopPropagation();
    this.props.executeCmd(cmd.connectToGameServer(url));

    this.props.appState.tryJoin = {
      url,
      type: 'observer',
    };
  };
}
