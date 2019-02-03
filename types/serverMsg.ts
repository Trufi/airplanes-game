export type ServerMsg =
    | StartDataServerMsg
    | PlayerLeaveServerMsg
    | TickDataServerMsg
    ;

export interface StartDataServerMsg {
    type: 'startData';
    data: {
        id: number;
    };
}

export interface PlayerLeaveServerMsg {
    type: 'playerLeave';
    data: {
        playerId: number;
    };
}

export interface TickDataServerMsg {
    type: 'tickData';
    // TODO
}
