export interface NotifyRequest {
  url: string;
  type: 'dm' | 'tournament';
  city: string;
  players: number;
  maxPlayers: number;
}

export interface PlayerRequest {
  gameUrl: string;
  playerToken: string;
}

export interface PlayerResponse {
  id: number;
  name: string;
}
