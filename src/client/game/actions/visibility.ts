import { State } from '../../types';
import { keyboard } from '../../common/keyboard';

export const visibilityChange = (state: State, visibility: VisibilityState) => {
  keyboard.reset(state.keyboard);
  state.visibility = visibility;
};
