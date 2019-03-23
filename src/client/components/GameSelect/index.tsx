import * as React from 'react';
import { cmd } from '../../commands';
import { ExecuteCmd } from '../../commands/execute';
import { AppState } from '../../types';
import { getList } from '../../services/game';
import { GamelistResponse } from '../../../mainServer/types/api';
import styles from './index.css';
import classNames from 'classnames';

interface State {
  gamelist: GamelistResponse;
  gameMode: any;
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
      gameMode: null,
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
    const { gamelist, gameMode } = this.state;
    const CITY_NAMES_MAP: any = {
      nsk: 'Novosibirsk',
      omsk: 'Omsk',
      tomsk: 'Tomsk',
      barnaul: 'Barnaul',
      kemerovo: 'Kemerovo',
      krasnoyarsk: 'Krasnoyarsk',
    };

    return (
      <div className={styles.container}>
        {!gameMode ? (
          <div className={styles.entersContainer}>
            <div className={styles.enterItem}>
              <div className={styles.dmIcon} onClick={() => this.setGameMode('dm')} />
              <div>DeathMatch</div>
            </div>
            <div className={styles.enterItem}>
              <div className={styles.tourIcon} onClick={() => this.setGameMode('tour')} />
              <div>Tournament</div>
            </div>
          </div>
        ) : (
          <div className={styles.list}>
            {gamelist.length === 0 ? (
              <div>These aren't the games you're looking for.</div>
            ) : (
              gamelist.map(({ url, players, maxPlayers, city }, i) => {
                const cityName = CITY_NAMES_MAP[city];
                const iconClass = classNames({
                  [styles.icon]: true,
                  [styles[city]]: true,
                });

                return (
                  <div key={i} className={styles.gameItem} onClick={() => this.gameSelected(url)}>
                    <div className={styles.itemRounded}>
                      <div className={iconClass} />
                    </div>
                    <div className={styles.cityName}>
                      {cityName}
                      <br />
                      {players}/{maxPlayers}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
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

  private setGameMode = (mode: string) => {
    this.setState({
      gameMode: mode,
    });
  };

  // private gameObserve = (ev: React.MouseEvent, url: string) => {
  //   ev.stopPropagation();
  //   this.props.executeCmd(cmd.connectToGameServer(url));

  //   this.props.appState.tryJoin = {
  //     url,
  //     type: 'observer',
  //   };
  // };
}
