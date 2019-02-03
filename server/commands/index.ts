export const sendPlayersTickDataCmd = () => ({
    type: 'sendPlayersTickData' as 'sendPlayersTickData',
});

export const sendStartDataCmd = (playerId: number) => ({
    type: 'sendStartData' as 'sendStartData',
    playerId,
});

export const sendPlayerLeaveCmd = (playerId: number) => ({
    type: 'sendPlayerLeave' as 'sendPlayerLeave',
    playerId,
});

export type ExistCmd =
    | ReturnType<typeof sendPlayersTickDataCmd>
    | ReturnType<typeof sendStartDataCmd>
    | ReturnType<typeof sendPlayerLeaveCmd>
    ;

export type Cmd = ExistCmd | undefined;
