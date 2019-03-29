import * as React from 'react';
import classnames from 'classnames';
import styles from './index.css';
import * as moment from 'moment';
import { getTournamentPretenders, getTournamentList } from '../../services/tournaments';
import { Pretender, Tournament } from '../../../mainServer/models/types';

interface State {
  tournaments: Tournament[];
  pretenders: Pretender[];
}

const emptyArr = new Array(35).fill('');
const STATUS_TEXT_MAP: any = {
  finished: 'finished',
  rightNow: 'right now',
};

export class TopRating extends React.PureComponent<{}, State> {
  public state: State = {
    tournaments: [],
    pretenders: [],
  };

  public componentDidMount(): void {
    setInterval(() => {
      this.update();
    }, 30000);
    this.update();
  }

  public render() {
    const { tournaments, pretenders } = this.state;

    return (
      <div className={styles.mainContainer}>
        <div className={styles.leftContainer}>
          <div className={styles.header}>
            <div className={styles.logoContainer}>
              <div className={styles.logo} />
              <div className={styles.cover} />
            </div>
            <div className={styles.title}>final list</div>
          </div>
          <div>
            <ol>
              {emptyArr.map((item, index) => {
                const guy = pretenders[index] || {};
                return (
                  <li key={index}>
                    <div className={styles.item}>
                      <div className={styles.nickname}>{guy.username || item}</div>
                      <div className={styles.points}>{guy.tournament}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        <div className={styles.rightContainer}>
          {tournaments.map(this.formatter).map((item, index) => {
            const className = classnames({
              [styles.timeItemIcon]: true,
              [styles[item.status]]: true,
            });
            const textClassName = classnames({
              [styles.text]: true,
              [styles[item.status]]: true,
            });
            return (
              <div key={index} className={styles.timeItem}>
                <div className={className} />
                <div className={textClassName}>
                  {STATUS_TEXT_MAP[item.status] || (
                    <div>
                      <div className={styles.eventTime}>{item.time}</div>
                      <div className={styles.eventDate}>{item.date}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  private update() {
    getTournamentList()
      .then(({ tournaments }) => {
        this.setState({ tournaments });
      })
      .catch(() => {
        console.log('getTournamentList:errors');
      });

    getTournamentPretenders()
      .then(({ pretenders }) => {
        this.setState({ pretenders });
      })
      .catch(() => {
        console.log('getTournamentPretenders:errors');
      });
  }

  private formatter = (tournament: Tournament) => {
    const startOn = moment(tournament.start_on);
    // description: ""
    // duration_min: "10"
    // id: "2"
    // input_count: "4"
    // is_grand_final: 0
    // machine_name: "t1"
    // name: "Tournament #1"
    // output_count: "2"
    // start_on: "2019-03-22T03:30:00.527Z"
    const now = moment();
    const nowUnix = now.unix();
    const startOnUnix = startOn.unix();
    let status = 'finished';
    if (nowUnix < startOnUnix) {
      status = 'next';
    }
    if (nowUnix >= startOnUnix && nowUnix <= startOn.add(tournament.duration_min, 'm').unix()) {
      status = 'rightNow';
    }

    return {
      id: tournament.id,
      date: startOn.format('MMMM DD'),
      time: startOn.format('LT'),
      status,
    };
  };
}
