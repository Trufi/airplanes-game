import * as React from 'react';
import { PhysicBodyState } from '../../types';
import styles from './index.css';

interface Props {
  body: PhysicBodyState;
}

export const Health = ({ body: { health } }: Props) => {
  return (
    <div className={styles.healthBar}>
      <div className={styles.healthInner}>
        <div className={styles.dividers}>
          <div className={styles.divider} />
          <div className={styles.divider} />
          <div className={styles.divider} />
          <div className={styles.divider} />
          <div className={styles.divider} />
          <div className={styles.divider} />
          <div className={styles.divider} />
          <div className={styles.divider} />
          <div className={styles.divider} />
        </div>
        <div className={styles.healthValue} style={{ width: `${health}%` }} />
      </div>
    </div>
  );
};
