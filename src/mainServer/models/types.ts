export interface UserCreation {
  name: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  password: string;
  sessionId: string;
}

export interface UserStats {
  id: number;
  name: string;
  kills: number;
  deaths: number;
  points: number;
}

export interface Pretender {
  tournament_id: number;
  user_id: number;
  tournament: string;
  username: string;
  points: number;
}

export interface Tournament {
  id: number;
  name: string;
  description: string;
  kills?: number;
  deaths?: number;
  points?: number;
  start_on: number;
  duration_min: number;
  input_count: number;
  output_count: number;
  is_grand_final: boolean;
}

export interface Achievement {
  id: number;
  machine_name: string;
  name: string;
  description: string;
}
