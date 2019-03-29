import * as React from 'react';
import styles from './index.css';

export class Dashboard extends React.PureComponent {
  public render() {
    return (
      <div>
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.logoContainer}>
              <div className={styles.logo} />
              <div className={styles.cover} />
            </div>
          </div>
          <div>
            <ol>
              <div className={styles.top}>
                <li>
                  <div className={styles.person}>
                    <div>Nickname</div>
                    <div>1000</div>
                  </div>
                </li>
                <li>
                  <div className={styles.person}>
                    <div>Nickname</div>
                    <div>1000</div>
                  </div>
                </li>
                <li>
                  <div className={styles.person}>
                    <div>Nickname</div>
                    <div>1000</div>
                  </div>
                </li>
                <li>
                  <div className={styles.person}>
                    <div>Nickname</div>
                    <div>1000</div>
                  </div>
                </li>
                <li>
                  <div className={styles.person}>
                    <div>Nickname</div>
                    <div>1000</div>
                  </div>
                </li>
              </div>
              <div className={styles.other}>
                <li>
                  <div className={styles.person}>
                    <div>Nickname</div>
                    <div>1000</div>
                  </div>
                </li>
                <li>
                  <div className={styles.person}>
                    <div>Nickname</div>
                    <div>1000</div>
                  </div>
                </li>
                <li>
                  <div className={styles.person}>
                    <div>Nickname</div>
                    <div>1000</div>
                  </div>
                </li>
                <li>
                  <div className={styles.person}>
                    <div>Nickname</div>
                    <div>1000</div>
                  </div>
                </li>
              </div>
            </ol>
          </div>
        </div>
      </div>
    );
  }
}
