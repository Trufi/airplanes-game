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

export interface Tournament {
  id: number;
  name: string;
  description: string;
  kills: number;
  deaths: number;
  points: number;
}

export interface Achievement {
  id: number;
  machine_name: string;
  name: string;
  description: string;
}
