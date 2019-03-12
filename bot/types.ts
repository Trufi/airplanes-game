export interface BotBody {
  position: number[];
  velocity: number;
  rotation: number[];
  velocityDirection: number[];
  weapon: {
    lastShotTime: number;
    hits: [];
  };
}
