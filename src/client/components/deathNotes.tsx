import * as React from 'react';
import { State } from '../types';
import { DeathNote } from '../common/notes';
import { ObserverState } from '../observer/types';

const Note = ({ state, note }: { state: State | ObserverState; note: DeathNote }): JSX.Element => {
  let deadName: string | undefined;

  if (state.type === 'game' && note.deadPlayerId === state.player.id) {
    deadName = state.player.name;
  } else {
    const deadPlayer = state.players.get(note.deadPlayerId);
    if (deadPlayer) {
      deadName = deadPlayer.name;
    }
  }

  let causeName: string | undefined;
  if (state.type === 'game' && note.causePlayerId === state.player.id) {
    causeName = state.player.name;
  } else {
    const causePlayer = state.players.get(note.causePlayerId);
    if (causePlayer) {
      causeName = causePlayer.name;
    }
  }

  if (!deadName || !causeName) {
    return <div />;
  }

  return (
    <div>
      <span style={{ color: '#ff0000' }}>{causeName}</span> kill{' '}
      <span style={{ color: '#0000ff' }}>{deadName}</span>
    </div>
  );
};

interface Props {
  state: State | ObserverState;
}

export class DeathNotes extends React.Component<Props, {}> {
  public render() {
    const { state } = this.props;

    return (
      <div
        style={{
          position: 'absolute',
          top: '0',
          right: '0',
          zIndex: 200,
        }}
      >
        {state.notes.notes.map((note, i) => (
          <Note note={note} state={state} key={i} />
        ))}
      </div>
    );
  }
}
