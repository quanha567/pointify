import { describe, it, expect } from 'bun:test';
import { Room } from '../../domain/room.aggregate.js';
import { Participant } from '../../domain/entities/participant.entity.js';
import { StickyNote } from '../../domain/entities/sticky-note.entity.js';
import { Deck } from '../../domain/value-objects/deck.vo.js';
import { RoomMapper } from './room.mapper.js';

describe('RoomMapper', () => {
  it('should serialize and deserialize stickyNotes and round archivedStickyNotes correctly', () => {
    const facilitator = Participant.create('user-1', {
      displayName: 'Alice',
      photoURL: null,
      isGuest: false,
    });

    const room = Room.create({
      id: 'room-123',
      name: 'Sprint Planning',
      facilitator,
      deck: Deck.fibonacci(),
    });

    // Add sticky notes
    const pinnedNote = StickyNote.create('note-1', {
      roomId: 'room-123',
      text: 'DoD: Code Review Required',
      color: 'yellow',
      position: { x: 100, y: 150 },
      authorId: 'user-1',
      authorName: 'Alice',
      isPinned: true,
    });
    const unpinnedNote = StickyNote.create('note-2', {
      roomId: 'room-123',
      text: 'Assumption: DB migration needed',
      color: 'blue',
      position: { x: 200, y: 250 },
      authorId: 'user-1',
      authorName: 'Alice',
      isPinned: false,
    });

    room.addStickyNote(pinnedNote);
    room.addStickyNote(unpinnedNote);

    // Advance to next round - unpinned note should be archived into round 1
    room.nextRound(room.facilitatorKey.value, 'Topic 2');

    // Add another live note in round 2
    const liveNote = StickyNote.create('note-3', {
      roomId: 'room-123',
      text: 'Live note in Round 2',
      color: 'green',
      position: { x: -100, y: 50 },
      authorId: 'user-1',
      authorName: 'Alice',
    });
    room.addStickyNote(liveNote);

    // Map to persistence (Firestore doc)
    const persistenceDoc = RoomMapper.toPersistence(room);

    expect(persistenceDoc.stickyNotes).toBeDefined();
    expect(persistenceDoc.stickyNotes?.length).toBe(2); // note-1 (pinned) + note-3 (live)
    expect(persistenceDoc.roundsHistory[0].archivedStickyNotes?.length).toBe(1);
    expect(persistenceDoc.roundsHistory[0].archivedStickyNotes?.[0].id).toBe('note-2');

    // Map back to domain
    const reconstructedRoom = RoomMapper.toDomain(persistenceDoc);

    expect(reconstructedRoom.stickyNotes.size).toBe(2);
    expect(reconstructedRoom.stickyNotes.get('note-1')?.text).toBe('DoD: Code Review Required');
    expect(reconstructedRoom.stickyNotes.get('note-1')?.isPinned).toBe(true);
    expect(reconstructedRoom.stickyNotes.get('note-3')?.text).toBe('Live note in Round 2');

    expect(reconstructedRoom.roundsHistory[0].archivedStickyNotes.length).toBe(1);
    expect(reconstructedRoom.roundsHistory[0].archivedStickyNotes[0].text).toBe(
      'Assumption: DB migration needed',
    );
  });
});
