import { initBot } from './bot';

// const serverUrl = `localhost:3002`;
const serverUrl = `demo.webmaps-dev.os-n3.hw:3002`;

const botNumber = 50;
const gameId = 1;

for (let i = 0; i < botNumber; i++) {
  const name = `Bot ${i}`;
  initBot(serverUrl, name, gameId);
}
