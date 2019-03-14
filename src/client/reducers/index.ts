import { AppState } from '../types';
import { AnyServerMsg, ServerMsg } from '../../server/messages';
import { Cmd } from '../commands';
import { message as gameMessage } from '../game/actions/message';
import { message as observerMessage } from '../observer/reducer';
import { start as startGame } from '../game';
import { start as startObserver } from '../observer/start';

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
  }
};

const saveConnectId = (appState: AppState, msg: ServerMsg['connect']): Cmd => {
  appState.id = msg.id;
};

const startData = (appState: AppState, msg: ServerMsg['startData']): Cmd => {
  appState.type = 'game';
  startGame(msg);
};

const startObserverData = (appState: AppState, msg: ServerMsg['startObserverData']): Cmd => {
  appState.type = 'observer';
  startObserver(appState, msg);
};
