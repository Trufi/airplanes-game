import * as React from 'react';
import classnames from 'classnames';
import styles from './index.css';

export const TopRating = () => {
  const emptyArr = new Array(35).fill('');
  const guys = [
    {
      name: 'Nick',
      points: '100500',
    },
    {
      name: 'Nickname',
      points: '1005',
    },
    {
      name: 'longnicknameyoyoyo123500',
      points: '500',
    },
    {
      name: 'Jepa',
      points: '3',
    },
  ];
  const timeTable = [
    {
      id: 1,
      time: '15:00',
      date: '30 марта',
      status: 'finished',
    },
    {
      id: 2,
      time: '15:00',
      date: '30 марта',
      status: 'finished',
    },
    {
      id: 3,
      time: '15:00',
      date: '30 марта',
      status: 'rightNow',
    },
    {
      id: 4,
      time: '15:00',
      date: '30 марта',
      status: 'next',
    },
    {
      id: 5,
      time: '15:00',
      date: '30 марта',
      status: 'willBe',
    },
    {
      id: 6,
      time: '15:00',
      date: '31 марта',
      status: 'willBe',
    },
    {
      id: 7,
      time: '15:00',
      date: '31 марта',
      status: 'willBe',
    },
  ];
  const STATUS_TEXT_MAP: any = {
    finished: 'finished',
    rightNow: 'right now',
  };
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
              const guy = guys[index] || {};
              return (
                <li key={index}>
                  <div className={styles.item}>
                    <div className={styles.nickname}>{guy.name || item}</div>
                    <div className={styles.points}>{guy.points}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <div className={styles.rightContainer}>
        {timeTable.map((item) => {
          const className = classnames({
            [styles.timeItemIcon]: true,
            [styles[item.status]]: true,
          });
          const textClassName = classnames({
            [styles.text]: true,
            [styles[item.status]]: true,
          });
          return (
            <div className={styles.timeItem}>
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
};
