import * as React from 'react';
import { cmd } from '../../commands';
import { ExecuteCmd } from '../../commands/execute';
import { userAuth, userLogin, userRegister } from '../../services/user';
import { get, set } from 'js-cookie';
import { AppState } from '../../types';
import styles from './index.css';

interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

export class Login extends React.Component<Props, {}> {
  private inputNameRef: React.RefObject<HTMLInputElement>;
  private inputPassRef: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);

    this.inputNameRef = React.createRef();
    this.inputPassRef = React.createRef();
  }

  public componentDidMount() {
    const token = get('token');
    if (token) {
      userAuth({ token })
        .then(this.userAuthSignal)
        .catch((err: any) => {
          console.log('auth err', err);
        });
    }
  }

  public render() {
    return (
      <div className={styles.container}>
        <div className={styles.logo} />
        <div className={styles.relativeContainer}>
          <div className={styles.inputContainer}>
            <input
              className={styles.input}
              ref={this.inputNameRef}
              type='text'
              onKeyPress={this.onKeyPress}
            />
            <input
              className={styles.input}
              ref={this.inputPassRef}
              type='password'
              onKeyPress={this.onKeyPress}
            />
          </div>
          <button className={styles.button} onClick={this.submit}>
            Start
          </button>
        </div>
      </div>
    );
  }

  private submit = () => {
    const usernameInput = this.inputNameRef.current;
    const passwordInput = this.inputPassRef.current;
    if (!usernameInput || !passwordInput) {
      return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username.length > 3 || password.length > 3) {
      // @TODO КОСТЫЛЬ PIZDEC NAHOY BLYAT
      // Если юзер вбил свой логин/пароль, мы его регаем.
      // Если при регистрации произошла ошибка, значит юзер с таким именем уже есть.
      // Поэтому при ошибке на регистрацию, пытаемся логиниить.
      userRegister({ password, username })
        .then(this.userAuthSignal)
        .catch((err: any) => {
          console.log('register err', err);
          userLogin({ password, username })
            .then(this.userAuthSignal)
            .catch((err: any) => {
              console.log('login err', err);
            });
        });
    }
  };

  private userAuthSignal = (data: any) => {
    set('token', data.user.token);
    this.notifySignal(data);
  };

  private notifySignal = (data: any) => {
    const { appState, executeCmd } = this.props;

    console.log('Auth Success', data.user);
    appState.type = 'gameSelect';
    appState.token = data.user.token;
    appState.name = data.user.name;
    executeCmd(cmd.renderUI());
  };

  private onKeyPress = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.which === 13) {
      this.submit();
    }
  };
}