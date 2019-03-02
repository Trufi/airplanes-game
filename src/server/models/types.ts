export interface UserCreation {
  name: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  password: string;
  sessionId: string;
  kills?: number;
  death?: number;
  points?: number;
}

export interface Achievement {
  id: number;
  machine_name: string;
  name: string;
  description: string;
}
