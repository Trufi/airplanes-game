import * as React from 'react';
import styles from './index.css';
import { RadarLoader } from '../RadarLoader';

export class Connection extends React.PureComponent {
  public render() {
    return (
      <div className={styles.container}>
        <div className={styles.entersContainer}>
          <div className={styles.enterItem}>
            <RadarLoader />
            <div>Connect...</div>
          </div>
        </div>
      </div>
    );
  }
}
