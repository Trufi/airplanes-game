export interface KeyboardState {
  pressedKeys: { [key: string]: boolean };

  handlers: {
    keyUp: (ev: KeyboardEvent) => void;
    keyDown: (ev: KeyboardEvent) => void;
  };
}

const reset = (state: KeyboardState) => {
  const { pressedKeys } = state;
  for (const key in pressedKeys) {
    pressedKeys[key] = false;
  }
};

const keyDown = (state: KeyboardState, ev: KeyboardEvent) => {
  state.pressedKeys[ev.code] = true;
};

const keyUp = (state: KeyboardState, ev: KeyboardEvent) => {
  state.pressedKeys[ev.code] = false;
};

const enable = (): KeyboardState => {
  const state: KeyboardState = {
    pressedKeys: {},
    handlers: {
      keyUp: () => {},
      keyDown: () => {},
    },
  };

  state.handlers.keyUp = keyUp.bind(undefined, state);
  state.handlers.keyDown = keyDown.bind(undefined, state);

  window.addEventListener('keyup', state.handlers.keyUp);
  window.addEventListener('keydown', state.handlers.keyDown);

  return state;
};

const disable = (state: KeyboardState) => {
  window.removeEventListener('keyup', state.handlers.keyUp);
  window.removeEventListener('keydown', state.handlers.keyDown);
};

const getPressedKeys = (state: KeyboardState) => {
  return Object.entries(state.pressedKeys)
    .filter((entry) => entry[1])
    .map((entry) => entry[0]);
};

export const keyboard = {
  enable,
  disable,
  getPressedKeys,
  reset,
};
