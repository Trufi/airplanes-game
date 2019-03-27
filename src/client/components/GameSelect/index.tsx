import * as React from 'react';
import { ExecuteCmd } from '../../commands/execute';
import { AppState } from '../../types';
import { getList } from '../../services/game';
import { GamelistResponse } from '../../../mainServer/types/api';
import styles from './index.css';
import classNames from 'classnames';
import { joinGame } from '../../reducers';
import { City } from '../../../types';
import { canIjoinToGrandFinal } from '../../services/user';
import { cityOrder } from '../../../cities';

interface State {
  gamelist: GamelistResponse;
  gameMode: any;
  canJoinToGrandFinal: boolean;
}

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

const CITY_NAMES_MAP: { [name in City]: string } = {
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
    canJoinToGrandFinal: false,
  };

  public componentDidMount() {
    const { appState } = this.props;
    if (appState.token) {
      Promise.all([
        canIjoinToGrandFinal({ token: appState.token }),
        getList({ token: appState.token }),
      ]).then(([canJoinToGrandFinal, gamelist]) => {
        this.setState({ gamelist, canJoinToGrandFinal });
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
    const { gameMode, gamelist, canJoinToGrandFinal } = this.state;

    if (gameMode) {
      return null;
    }

    let tournamentTitle = 'Tournament';
    let enableTournament = false;
    let tournamentMessage = 'Скоро новый турнир';

    const tournament = getCurrentTournament(gamelist);
    if (tournament && tournament.enable) {
      if (tournament.isGrandFinal) {
        tournamentTitle = 'Grand Final';
        if (canJoinToGrandFinal) {
          enableTournament = true;
          tournamentMessage = '';
        } else {
          enableTournament = false;
          tournamentMessage = 'Ты не прошел в финал';
        }
      } else {
        if (canJoinToGrandFinal) {
          enableTournament = false;
          tournamentMessage = 'Ты уже в финале!';
        } else {
          enableTournament = true;
          tournamentMessage = '';
        }
      }
    }

    const dmIcon = classNames({
      [styles.enterIcon]: true,
      [styles.dmIcon]: true,
    });

    const tourIcon = classNames({
      [styles.enterIcon]: true,
      [styles.tourIcon]: true,
      [styles.enterIconInactive]: !enableTournament,
    });

    return (
      <div className={styles.entersContainer}>
        <div className={styles.enterItem}>
          <div className={dmIcon} onClick={() => this.setGameMode('dm')} />
          <div>DeathMatch</div>
        </div>
        <div
          className={classNames({
            [styles.enterItem]: true,
            [styles.enterItemDisable]: !enableTournament,
          })}
        >
          <div
            className={tourIcon}
            onClick={() => {
              if (enableTournament && tournament) {
                this.gameSelected(tournament.url);
              }
            }}
          />
          <div>{tournamentTitle}</div>
          <div className={styles.tournamentMessage}>{tournamentMessage}</div>
        </div>
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
    const deathMatchGames = gamelist.filter(({ type }) => type === 'dm');
    if (deathMatchGames.length === 0) {
      return (
        <div className={styles.enterItem}>
          <div>These aren't the games you're looking for.</div>
        </div>
      );
    }

    const sortedGames = deathMatchGames.sort((a, b) => {
      return cityOrder.indexOf(a.city) - cityOrder.indexOf(b.city);
    });

    return (
      <>
        {sortedGames.map(({ url, players, maxPlayers, city }, i) => (
          <div key={i}>{this.renderGameRoom(url, players, maxPlayers, city)}</div>
        ))}
      </>
    );
  };

  private renderGameRoom = (url: string, players: number, maxPlayers: number, city: City) => {
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

function getCurrentTournament(list: GamelistResponse) {
  for (const game of list) {
    if (game.type === 'tournament' && game.enable) {
      return game;
    }
  }
}
