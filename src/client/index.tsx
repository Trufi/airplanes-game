import './socket';
import { appState } from './appState';
import { renderUI } from './ui';
import { executeCmd } from './commands/execute';

renderUI(appState, executeCmd);

const fullscreenButton = document.getElementById('fullscreen') as HTMLElement;
fullscreenButton.addEventListener('click', () => {
  document.body.requestFullscreen();
});

window.addEventListener('resize', () => {
  document.body.style.width = `${window.innerWidth}px`;
  document.body.style.height = `${window.innerHeight}px`;
});
