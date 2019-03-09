import * as React from 'react';
import { cmd } from '../commands';
import { ExecuteCmd } from '../commands/execute';
import { userAuth, userLogin, userRegister } from '../services/user';
import { get, set } from 'js-cookie';
import { AppState } from '../types';
import { msg } from '../messages';

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
    const username = localStorage.getItem('name');
    if (token && username) {
      userAuth({ token })
        .then((data: any) => {
          console.log('Auth Success', data.user);
          this.props.appState.type = 'gameSelect';
          this.props.appState.token = data.user.token;
          this.props.appState.name = data.user.name;
          this.props.executeCmd(cmd.renderUI());

          // Посылаем также через сокеты, чтобы игровой сервер понял, что это за connection
          this.props.executeCmd(cmd.sendMsg(msg.auth(data.user.token)));
        })
        .catch((err: any) => {
          console.log('auth err', err);
        });
    }
  }

  public render() {
    return (
      <div
        style={{
          width: '200px',
          height: '100px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          margin: '-50px 0 0 -100px',
        }}
      >
        <h3>Login</h3>
        <input ref={this.inputNameRef} type='text' onKeyPress={this.onKeyPress} />
        <input ref={this.inputPassRef} type='text' onKeyPress={this.onKeyPress} />
        <button onClick={this.submit}>Start</button>
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
        .then((data: any) => {
          set('token', data.user.token);
          localStorage.setItem('name', data.user.name);
        })
        .catch((err: any) => {
          console.log('register err', err);
          userLogin({ password, username })
            .then((data: any) => {
              set('token', data.user.token);
              localStorage.setItem('name', data.user.name);
            })
            .catch((err: any) => {
              console.log('login err', err);
            });
        });
    }
  };

  private onKeyPress = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.which === 13) {
      this.submit();
    }
  };
}
