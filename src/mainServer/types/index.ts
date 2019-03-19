export interface Game {
  id: number;
  token: string;
  url: string;
  name: string;
  players: number;
}

export interface State {
  games: {
    nextId: number;
    map: Map<number, Game>;
    byToken: Map<string, Game>;
  };
}
