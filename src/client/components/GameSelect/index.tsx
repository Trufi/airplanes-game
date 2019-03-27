import * as React from 'react';
import { ExecuteCmd } from '../../commands/execute';
import { AppState } from '../../types';
import { getList } from '../../services/game';
import { GamelistResponse } from '../../../mainServer/types/api';
import styles from './index.css';
import classNames from 'classnames';
import { joinGame } from '../../reducers';

interface State {
  gamelist: GamelistResponse;
  gameMode: any;
}

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

const CITY_NAMES_MAP: any = {
  nsk: 'Novosibirsk',
  omsk: 'Omsk',
  tomsk: 'Tomsk',
  barnaul: 'Barnaul',
  kemerovo: 'Kemerovo',
  krasnoyarsk: 'Krasnoyarsk',
};

export class GameSelect extends React.PureComponent<Props, State> {
  public state = {
    gamelist: [],
    gameMode: null,
  };

  public componentDidMount() {
    const { appState } = this.props;
    if (appState.token) {
      getList({ token: appState.token }).then((data) => {
        this.setState({ gamelist: data });
      });
    }
  }

  public render() {
    return (
      <div className={styles.container}>
        {this.renderSelectMode()}
        {this.renderRooms()}
      </div>
    );
  }

  private renderSelectMode = () => {
    const { gameMode, gamelist } = this.state;

    if (gameMode) {
      return null;
    }

    const dmIcon = classNames({
      [styles.enterIcon]: true,
      [styles.dmIcon]: true,
    });

    const tourIcon = classNames({
      [styles.enterIcon]: true,
      [styles.tourIcon]: true,
    });

    const tournament = getTournament(gamelist);

    return (
      <div className={styles.entersContainer}>
        <div className={styles.enterItem}>
          <div className={dmIcon} onClick={() => this.setGameMode('dm')} />
          <div>DeathMatch</div>
        </div>
        {tournament &&
        tournament.enable && ( // TODO: не скрывать, а дизейблить
            <div className={styles.enterItem}>
              <div
                className={tourIcon}
                onClick={() => {
                  this.setGameMode('tour');
                  this.gameSelected(tournament.url);
                }}
              />
              <div>Tournament</div>
            </div>
          )}
      </div>
    );
  };

  private renderRooms = () => {
    const { gamelist, gameMode } = this.state;

    if (!gameMode) {
      return null;
    }

    return this.renderGameList(gamelist);
  };

  private renderGameList = (gamelist: GamelistResponse) => {
    if (gamelist.length === 0) {
      return (
        <div className={styles.enterItem}>
          <div>These aren't the games you're looking for.</div>
        </div>
      );
    }

    return (
      <>
        {gamelist
          .filter(({ type }) => type === 'dm')
          .map(({ url, players, maxPlayers, city }, i) => (
            <div key={i}>{this.renderGameRoom(url, players, maxPlayers, city)}</div>
          ))}
      </>
    );
  };

  private renderGameRoom = (url: string, players: number, maxPlayers: number, city: string) => {
    const cityName = CITY_NAMES_MAP[city];
    const iconClass = classNames({
      [styles.icon]: true,
      [styles[city]]: true,
    });

    return (
      <div className={styles.gameItem} onClick={() => this.gameSelected(url)}>
        <div className={styles.itemRounded}>
          <div className={iconClass} />
        </div>
        <div className={styles.cityName}>
          <div className={styles.title}>{cityName}</div>
          <div className={styles.stat}>
            {players}/{maxPlayers}
          </div>
        </div>
      </div>
    );
  };

  private gameSelected = (url: string) => {
    console.log('asdads');
    this.props.executeCmd(joinGame(this.props.appState, url));
  };

  private setGameMode = (mode: string) => {
    this.setState({
      gameMode: mode,
    });
  };
}

function getTournament(list: GamelistResponse) {
  for (const game of list) {
    if (game.type === 'tournament' && game.enable) {
      return game;
    }
  }
}
