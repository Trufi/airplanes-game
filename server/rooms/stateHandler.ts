import { Room, EntityMap, Client, nosync } from 'colyseus';

export class State {
  players: EntityMap<Player> = {};

  @nosync
  something = "This attribute won't be sent to the client-side";

  createPlayer(id: string) {
    this.players[id] = new Player();
  }

  removePlayer(id: string) {
    delete this.players[id];
  }

  movePlayer(id: string, movement: any) {
    this.players[id].x = movement.position[0];
    this.players[id].y = movement.position[1];
    this.players[id].vx = movement.velocity[0];
    this.players[id].vy = movement.velocity[1];
  }
}

export class Player {
  x = 989279049.1967943;
  y = 789621208.6300365;
  vx = 0;
  vy = 40;
}

export class StateHandlerRoom extends Room<State> {
  onInit(options) {
    console.log('StateHandlerRoom created!', options);

    this.setState(new State());
  }

  onJoin(client) {
    this.state.createPlayer(client.sessionId);
  }

  onLeave(client) {
    this.state.removePlayer(client.sessionId);
  }

  onMessage(client, data) {
    // console.log('StateHandlerRoom received message from', client.sessionId, ':', data);
    this.state.movePlayer(client.sessionId, data);
  }

  onDispose() {
    console.log('Dispose StateHandlerRoom');
  }
}
