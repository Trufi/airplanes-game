export type Msg =
    | StartMsg
    | ActionsMsg
    ;

export interface StartMsg {
    type: 'start';
    name: string;
}

export interface PlayerAction {
    type: 'left' | 'right' | 'up' | 'down';
}

export interface ActionsMsg {
    type: 'actions';
    actions: PlayerAction[];
}
