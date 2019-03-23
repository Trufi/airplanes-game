export interface User {
  id: number;
  name: string;
  token: string;
}

export interface UserStats extends User {
  kills: number;
  deaths: number;
  points: number;
}
