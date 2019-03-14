import * as config from '../../config';

export interface DeathNote {
  time: number;
  causePlayerId: number;
  deadPlayerId: number;
}

export const createNotesState = () => ({
  notes: [] as DeathNote[],
});

export type NotesState = ReturnType<typeof createNotesState>;

export const addKillNote = (
  state: NotesState,
  time: number,
  causePlayerId: number,
  deadPlayerId: number,
) => {
  state.notes.push({
    time,
    causePlayerId,
    deadPlayerId,
  });
};

export const hideOldNotes = (state: NotesState, time: number) => {
  state.notes = state.notes.filter((note) => time - note.time < config.deathNote.delay);
};
