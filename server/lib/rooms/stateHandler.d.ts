import { Room, EntityMap } from "colyseus";
export declare class State {
    players: EntityMap<Player>;
    something: string;
    createPlayer(id: string): void;
    removePlayer(id: string): void;
    movePlayer(id: string, movement: any): void;
}
export declare class Player {
    x: number;
    y: number;
}
export declare class StateHandlerRoom extends Room<State> {
    onInit(options: any): void;
    onJoin(client: any): void;
    onLeave(client: any): void;
    onMessage(client: any, data: any): void;
    onDispose(): void;
}
