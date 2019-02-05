import { Player, State } from '../types';
import { ActionsMsg } from '../../types/clientMsg';
import { Cmd } from '../commands';

export const saveActions = (state: State, player: Player, msg: ActionsMsg): Cmd => {
  const airplane = state.bodies.map.get(player.bodyId);
  if (!airplane) {
    return;
  }

  msg.actions.forEach((action) => {
    player.actions.set(action.type, action);
  });
};
