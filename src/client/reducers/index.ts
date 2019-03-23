import { AppState } from '../types';
import { AnyServerMsg, ServerMsg } from '../../gameServer/messages';
import { Cmd, cmd } from '../commands';
import { msg } from '../messages';
import { message as gameMessage } from '../game/actions/message';
import { message as observerMessage } from '../observer/reducer';
import { start as startGame } from '../game';
import { start as startObserver } from '../observer/start';

export const connected = (appState: AppState): Cmd => {
  if (appState.type !== 'gameSelect' || !appState.tryJoin || !appState.token) {
    return;
  }

  const {
    tryJoin: { type },
    token,
  } = appState;

  if (type === 'player') {
    return [cmd.renderUI(), cmd.sendMsg(msg.joinGame(token))];
  } else if (type === 'observer') {
    return [cmd.renderUI(), cmd.sendMsg(msg.joinGameAsObserver(token))];
  } else if (type === 'bot' && appState.name) {
    return [cmd.renderUI(), cmd.sendMsg(msg.joinGameAsBot(appState.name))];
  }
};

export const message = (appState: AppState, msg: AnyServerMsg): Cmd => {
  if (appState.type === 'game' && appState.game) {
    return gameMessage(appState.game, msg);
  } else if (appState.type === 'observer' && appState.observer) {
    return observerMessage(appState.observer, msg);
  }

  switch (msg.type) {
    case 'connect':
      return saveConnectId(appState, msg);
    case 'startData':
      return startData(appState, msg);
    case 'startObserverData':
      return startObserverData(appState, msg);
    case 'gameJoinFail':
      return gameJoinFail(appState, msg);
  }
};

const saveConnectId = (appState: AppState, msg: ServerMsg['connect']): Cmd => {
  appState.id = msg.id;
};

const startData = (appState: AppState, msg: ServerMsg['startData']): Cmd => {
  appState.type = 'game';
  appState.tryJoin = undefined;
  startGame(msg);
};

const startObserverData = (appState: AppState, msg: ServerMsg['startObserverData']): Cmd => {
  appState.type = 'observer';
  appState.tryJoin = undefined;
  startObserver(appState, msg);
};

const gameJoinFail = (appState: AppState, _msg: ServerMsg['gameJoinFail']): Cmd => {
  appState.tryJoin = undefined;
  return cmd.renderUI();
};
