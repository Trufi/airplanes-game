import * as ws from 'ws';
import { PlayerAction } from '../../types/clientMsg';

export interface InitialConnection {
    status: 'initial';
    id: number;
    socket: ws;
}

export interface PlayerConnection {
    status: 'player';
    id: number;
    socket: ws;
    playerId: number;
}

export type Connection =
    | InitialConnection
    | PlayerConnection
    ;

export interface ConnectionsState {
    map: Map<number, Connection>;
    nextId: number;
}

export interface Player {
    id: number;
    connectionId: number;
    name: string;
    bodyId: number;
    actions: Map<string, PlayerAction>;
}

export interface PlayersState {
    map: Map<number, Player>;
    nextId: number;
}

export interface Airplane {
    id: number;
    position: number[];
    angle: number[]; // кватернион
    velocity: number[];
}

export type Body =
    | Airplane
    ;

export interface BodiesState {
    map: Map<number, Body>;
    nextId: number;
}

export interface State {
    prevTime: number;
    time: number;
    connections: ConnectionsState;
    players: PlayersState;
    bodies: BodiesState;
}
