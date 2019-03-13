import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppState } from './types';
import { Root } from './components/root';
import { ExecuteCmd } from './commands/execute';

const root = document.getElementById('root') as HTMLElement;

// Убираем дефолтное поведение на iphone
root.addEventListener('touchmove', (ev) => ev.preventDefault());

export const renderUI = (appState: AppState, executeCmd: ExecuteCmd) => {
  ReactDOM.render(<Root appState={appState} executeCmd={executeCmd} />, root);
};
