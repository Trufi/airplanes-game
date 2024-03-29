import { PlayerState, CameraState, NonPhysicBodyState } from '../types';
import { NotesState } from '../common/notes';
import { ControlState } from './control';
import { KeyboardState } from '../common/keyboard';
import { ServerTimeState } from '../common/serverTime';
import { HealPointsState } from '../game/actions/healPoints';

export interface ObserverState {
  type: 'observer';
  time: number;
  prevTime: number;

  restartTime: number;
  serverEndTime: number;

  /**
   * Начало системы отсчета.
   * Нужен для того, чтобы глобальные координаты не выходили за int32 (максимум точности в шейдерах)
   */
  origin: number[];

  players: Map<number, PlayerState>;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: CameraState;

  bodies: Map<number, NonPhysicBodyState>;
  healPoints: HealPointsState;
  serverTime: ServerTimeState;

  keyboard: KeyboardState;

  notes: NotesState;

  control: ControlState;

  callbacks: {
    loopId: number;
    loop: () => void;
    pingId: number;
    ping: () => void;
    resize: () => void;
  };
}
