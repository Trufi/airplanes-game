import * as ws from 'ws';
import { Msg, StartMsg } from '../../types/clientMsg';
import {
    Connection,
    ConnectionsState,
    InitialConnection,
    Player,
    PlayerConnection,
    State,
    Airplane,
} from '../types';
import { saveActions } from './playerActions';
import { Cmd, sendStartDataCmd, sendPlayerLeaveCmd } from '../commands';

export const createNewConnection = (state: ConnectionsState, socket: ws): number => {
    const connection: InitialConnection = {
        status: 'initial',
        id: state.nextId,
        socket,
    };
    state.nextId++;
    state.map.set(connection.id, connection);
    return connection.id;
};

/**
 * Обработка сообщений клиента
 */
export const message = (state: State, connectionId: number, msg: Msg): Cmd => {
    const connection = state.connections.map.get(connectionId);
    if (!connection) {
        return;
    }

    switch (connection.status) {
        case 'initial':
            return initialConnectionMessage(state, connection, msg);
        case 'player':
            return playerConnectionMessage(state, connection, msg);
    }
};

export const initialConnectionMessage = (state: State, connection: InitialConnection, msg: Msg): Cmd => {
    switch (msg.type) {
        case 'start':
            return createNewPlayer(state, connection, msg);
    }
};

export const playerConnectionMessage = (state: State, connection: PlayerConnection, msg: Msg): Cmd => {
    const player = state.players.map.get(connection.playerId);
    if (!player) {
        return;
    }

    switch (msg.type) {
        case 'actions':
            return saveActions(state, player, msg);
    }
};

export const createNewPlayer = (state: State, connection: Connection, msg: StartMsg): Cmd => {
    const bodyId = createNewAirplane(state);

    const player: Player = {
        id: state.players.nextId,
        connectionId: connection.id,
        name: msg.name,
        bodyId,
        actions: new Map(),
    };

    state.players.nextId++;
    state.players.map.set(player.id, player);

    return sendStartDataCmd(player.id);
};

const createNewAirplane = (state: State): number => {
    const airplane: Airplane = {
        id: state.bodies.nextId,
        position: [0, 0, 0],
        angle: [0, 0, 0, 0],
        velocity: [0, 0, 0],
    };

    state.bodies.nextId++;
    state.bodies.map.set(airplane.id, airplane);

    return airplane.id;
};

export const connectionLost = (state: State, connectionId: number): Cmd => {
    const connection = state.connections.map.get(connectionId);
    if (!connection) {
        return;
    }
    state.connections.map.delete(connectionId);

    if (connection.status === 'player') {
        const player = state.players.map.get(connection.playerId);
        if (player) {
            state.players.map.delete(player.id);
            return sendPlayerLeaveCmd(player.id);
        }
    }
};
