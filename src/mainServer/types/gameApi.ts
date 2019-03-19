export interface RegisterRequest {
  name: string;
  url: string;
}

export interface RegisterResponse {
  token: string;
}

export interface UpdateRequest {
  token: string;
  players: number;
}

export interface PlayerRequest {
  token: string;
  playerToken: string;
}

export interface PlayerResponse {
  id: number;
  name: string;
}
