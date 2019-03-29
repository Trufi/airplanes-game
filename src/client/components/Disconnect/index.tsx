import * as React from 'react';
import styles from './index.css';

export class Disconnect extends React.PureComponent {
  public render() {
    return (
      <div className={styles.container}>
        <div className={styles.inputContainer}>
          <div className={styles.text}>Disconnect</div>
          <button className={styles.button} onClick={this.reload}>
            Reload
          </button>
        </div>
      </div>
    );
  }

  private reload = () => {
    location.reload();
  };
}
