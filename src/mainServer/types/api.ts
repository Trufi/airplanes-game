export type GamelistResponse = Array<{
  type: string;
  city: string;
  players: number;
  maxPlayers: number;
  url: string;
}>;
