import * as React from 'react';
import { cmd } from '../../commands';
import { ExecuteCmd } from '../../commands/execute';
import { userAuth, userLogin, userRegister } from '../../services/user';
import * as cookie from 'js-cookie';
import { AppState } from '../../types';
import styles from './index.css';
import classNames from 'classnames';
interface Props {
  appState: AppState;
  executeCmd: ExecuteCmd;
}

interface State {
  isError: boolean;
  isFilled: boolean;
}

export class Login extends React.Component<Props, State> {
  private inputNameRef: React.RefObject<HTMLInputElement>;
  private inputPassRef: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      isError: false,
      isFilled: false,
    };
    this.inputNameRef = React.createRef();
    this.inputPassRef = React.createRef();
  }

  public componentDidMount() {
    const login = this.inputNameRef.current;
    if (login) {
      login.focus();
    }

    const token = cookie.get('token');
    if (token) {
      userAuth({ token })
        .then(this.userAuthSignal)
        .catch((err: any) => {
          console.log('auth err', err);
        });
    }
  }

  public render() {
    const containerClass = classNames({
      [styles.inputContainer]: true,
      [styles.inputContainerError]: this.state.isError,
    });
    const buttonClass = classNames({
      [styles.button]: true,
      [styles.buttonActive]: this.state.isFilled,
    });

    return (
      <div className={styles.container}>
        <div className={styles.logo} />
        <div className={styles.relativeContainer}>
          <div className={containerClass}>
            <input
              className={styles.input}
              onChange={this.handleChange}
              ref={this.inputNameRef}
              type='text'
              onKeyPress={this.onLoginKeyPress}
              maxLength={30}
              autoFocus
              placeholder={'Nickname'}
            />
            <input
              className={styles.input}
              onChange={this.handleChange}
              ref={this.inputPassRef}
              type='password'
              onKeyPress={this.onPasswordKeyPress}
              placeholder={'Password'}
            />
          </div>
          <button className={buttonClass} onClick={this.submit}>
            Start
          </button>
        </div>
      </div>
    );
  }

  private handleChange = () => {
    const usernameInput = this.inputNameRef.current;
    const passwordInput = this.inputPassRef.current;

    if (!usernameInput || !passwordInput) {
      return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username && password) {
      this.setState({
        isFilled: true,
      });
    }
  };

  private submit = () => {
    const usernameInput = this.inputNameRef.current;
    const passwordInput = this.inputPassRef.current;

    if (!usernameInput || !passwordInput) {
      return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
      this.setState({
        isError: true,
      });
    }

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
    cookie.set('token', data.user.token, { expires: 7 });
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

  private onLoginKeyPress = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.which === 13) {
      const password = this.inputPassRef.current;
      if (password) {
        password.focus();
      }
    }
  };

  private onPasswordKeyPress = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.which === 13) {
      this.submit();
    }
  };
}
