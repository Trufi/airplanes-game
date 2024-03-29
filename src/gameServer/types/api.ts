export interface KickAllRequest {
  secret: string;
}

export interface RestartRequest {
  name: string;
  duration: number;
  inSeconds: number;
  grand: boolean;
  secret: string;
}
