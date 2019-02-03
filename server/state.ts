import { State } from './types';

export const createState = (time: number): State => {
    return {
        prevTime: time,
        time,
        connections: {
            map: new Map(),
            nextId: 1,
        },
        players: {
            map: new Map(),
            nextId: 1,
        },
        bodies: {
            map: new Map(),
            nextId: 1,
        },
    };
};
