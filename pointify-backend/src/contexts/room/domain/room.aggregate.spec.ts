import { describe, it, expect } from 'vitest';
import { Room } from './room.aggregate.js';
import { Participant } from './entities/participant.entity.js';
import { Deck } from './value-objects/deck.vo.js';
import { FacilitatorKey } from './value-objects/facilitator-key.vo.js';

describe('Room Aggregate Root', () => {
  const createTestRoom = () => {
    const facilitator = Participant.create('user-1', {
      displayName: 'Alice (Host)',
      isGuest: false,
    });
    const key = FacilitatorKey.fromExisting('secret-key-123');
    const room = Room.create({
      id: 'room-abc',
      name: 'Sprint 42 Estimation',
      facilitator,
      deck: Deck.fibonacci(),
      facilitatorKey: key,
    });
    return { room, facilitator, key };
  };

  it('should initialize room with round 1 and facilitator participant', () => {
    const { room, facilitator } = createTestRoom();

    expect(room.id).toBe('room-abc');
    expect(room.name).toBe('Sprint 42 Estimation');
    expect(room.facilitatorId).toBe(facilitator.id);
    expect(room.currentRound.roundNumber).toBe(1);
    expect(room.currentRound.status).toBe('voting');
    expect(room.participants.size).toBe(1);
  });

  it('should allow participants to join the room', () => {
    const { room } = createTestRoom();
    const bob = Participant.create('user-2', { displayName: 'Bob' });
    room.join(bob);

    expect(room.participants.size).toBe(2);
    expect(room.participants.get('user-2')?.displayName).toBe('Bob');
  });

  it('should submit valid estimates and reject invalid cards', () => {
    const { room } = createTestRoom();
    const bob = Participant.create('user-2', { displayName: 'Bob' });
    room.join(bob);

    // Valid Fibonacci card
    const res1 = room.submitEstimate('user-2', 5);
    expect(res1.isOk).toBe(true);

    // Invalid card not in Fibonacci deck
    const res2 = room.submitEstimate('user-2', 999);
    expect(res2.isFail).toBe(true);
    expect(res2.isFail && res2.error.code).toBe('INVALID_CARD_VALUE');
  });

  it('should strictly mask estimates of other participants until cards are revealed', () => {
    const { room } = createTestRoom();
    const bob = Participant.create('user-2', { displayName: 'Bob' });
    const charlie = Participant.create('user-3', { displayName: 'Charlie' });
    room.join(bob);
    room.join(charlie);

    room.submitEstimate('user-2', 5);
    room.submitEstimate('user-3', 8);

    // Projection for Charlie during voting phase
    const charlieView = room.toProjection('user-3');
    const bobInCharlieView = charlieView.participants.find((p) => p.id === 'user-2');
    const charlieInCharlieView = charlieView.participants.find((p) => p.id === 'user-3');

    expect(bobInCharlieView?.hasEstimated).toBe(true);
    expect(bobInCharlieView?.estimatedValue).toBeNull(); // Masked!

    expect(charlieInCharlieView?.hasEstimated).toBe(true);
    expect(charlieInCharlieView?.estimatedValue).toBe(8); // Charlie can see their own!

    // Facilitator reveals cards
    const revealRes = room.revealCards('secret-key-123');
    expect(revealRes.isOk).toBe(true);

    // Projection for Charlie after reveal
    const charlieViewAfterReveal = room.toProjection('user-3');
    const bobAfterReveal = charlieViewAfterReveal.participants.find((p) => p.id === 'user-2');
    expect(bobAfterReveal?.estimatedValue).toBe(5); // Now unmasked!
    expect(charlieViewAfterReveal.currentRound.statistics?.average).toBe(6.5);
    expect(charlieViewAfterReveal.currentRound.statistics?.consensus).toBe(false);
  });

  it('should advance to next round and archive past rounds', () => {
    const { room } = createTestRoom();
    room.submitEstimate('user-1', 13);
    room.revealCards('secret-key-123');

    const nextRoundRes = room.nextRound('secret-key-123', 'Story #102 - Authentication');
    expect(nextRoundRes.isOk).toBe(true);

    expect(room.currentRound.roundNumber).toBe(2);
    expect(room.currentRound.topic).toBe('Story #102 - Authentication');
    expect(room.currentRound.status).toBe('voting');
    expect(room.roundsHistory.length).toBe(1);
    expect(room.roundsHistory[0].roundNumber).toBe(1);
  });

  it('should reset current round without incrementing roundNumber or pushing to history', () => {
    const { room } = createTestRoom();
    room.submitEstimate('user-1', 8);
    room.revealCards('secret-key-123');
    expect(room.currentRound.status).toBe('revealed');
    expect(room.currentRound.roundNumber).toBe(1);

    const resetRes = room.resetRound('secret-key-123');
    expect(resetRes.isOk).toBe(true);

    // Assert round number did NOT increment
    expect(room.currentRound.roundNumber).toBe(1);
    expect(room.currentRound.status).toBe('voting');
    expect(room.currentRound.estimates.size).toBe(0);
    expect(room.currentRound.revealedAt).toBeNull();
    expect(room.roundsHistory.length).toBe(0);

    // Participant estimates projection must be cleared
    const projection = room.toProjection('user-1');
    const user1 = projection.participants.find((p) => p.id === 'user-1');
    expect(user1?.hasEstimated).toBe(false);
    expect(user1?.estimatedValue).toBeNull();
  });

  it('should reject facilitator actions with invalid key', () => {
    const { room } = createTestRoom();
    const res = room.revealCards('wrong-key');
    expect(res.isFail).toBe(true);
    expect(res.isFail && res.error.code).toBe('UNAUTHORIZED_FACILITATOR');
  });

  it('should prevent claiming facilitator if current facilitator is active', () => {
    const { room } = createTestRoom();
    const bob = Participant.create('user-2', { displayName: 'Bob' });
    room.join(bob);

    const claimRes = room.claimFacilitator('user-2');
    expect(claimRes.isFail).toBe(true);
    expect(claimRes.isFail && claimRes.error.code).toBe('CANNOT_CLAIM_FACILITATOR');
  });

  it('should update participant online status correctly', () => {
    const { room } = createTestRoom();
    const bob = Participant.create('user-2', { displayName: 'Bob' });
    room.join(bob);

    expect(room.participants.get('user-2')?.isOnline).toBe(true);
    room.setParticipantOnline('user-2', false);
    expect(room.participants.get('user-2')?.isOnline).toBe(false);
  });

  it('should switch role to spectator and clear existing estimates', () => {
    const { room } = createTestRoom();
    const bob = Participant.create('user-2', { displayName: 'Bob' });
    room.join(bob);
    room.submitEstimate('user-2', 5);

    expect(room.currentRound.estimates.has('user-2')).toBe(true);

    const switchRes = room.switchParticipantRole('user-2', true);
    expect(switchRes.isOk).toBe(true);
    expect(room.participants.get('user-2')?.isSpectator).toBe(true);
    expect(room.currentRound.estimates.has('user-2')).toBe(false); // cleared!
  });

  it('should update room config and clear voting estimates when deck changes', () => {
    const facilitator = Participant.create('fac-1', { displayName: 'Facilitator' });
    const room = Room.create({ id: 'room-1', name: 'Original Name', facilitator });

    room.join(Participant.create('p1', { displayName: 'Player 1' }));
    room.submitEstimate('p1', 5);
    expect(room.currentRound.estimates.size).toBe(1);

    // Invalid key rejected
    const badRes = room.updateConfig('wrong-key', { name: 'New Name' });
    expect(badRes.isFail).toBe(true);

    // Valid update with deck change clears estimates
    const goodRes = room.updateConfig(room.facilitatorKey.value, {
      name: 'Updated Name',
      deck: Deck.tShirt(),
    });
    expect(goodRes.isOk).toBe(true);
    expect(goodRes.value.clearedVotes).toBe(true);
    expect(room.name).toBe('Updated Name');
    expect(room.deck.type).toBe('t-shirt');
    expect(room.currentRound.estimates.size).toBe(0);
  });

  it('should manage round countdown timer and clean up on reveal/next round', () => {
    const { room, key } = createTestRoom();

    // Initially timer is null
    expect(room.currentRound.timer).toBeNull();
    expect(room.toProjection().currentRound.timer).toBeNull();

    // Start timer with 120s
    const startRes = room.startTimer(key.value, 120);
    expect(startRes.isOk).toBe(true);
    expect(room.currentRound.timer?.durationSeconds).toBe(120);
    expect(room.currentRound.timer?.status).toBe('running');
    expect(room.currentRound.timer?.endsAt).toBeGreaterThan(Date.now());

    // Pause timer
    const pauseRes = room.pauseTimer(key.value);
    expect(pauseRes.isOk).toBe(true);
    expect(room.currentRound.timer?.status).toBe('paused');
    expect(room.currentRound.timer?.remainingSecondsOnPause).toBeDefined();

    // Add 30 seconds
    const addRes = room.addTimerSeconds(key.value, 30);
    expect(addRes.isOk).toBe(true);
    expect(room.currentRound.timer?.durationSeconds).toBe(150);

    // Resume timer
    const resumeRes = room.resumeTimer(key.value);
    expect(resumeRes.isOk).toBe(true);
    expect(room.currentRound.timer?.status).toBe('running');

    // Reject timer actions with invalid key
    const badKeyRes = room.startTimer('bad-key', 60);
    expect(badKeyRes.isFail).toBe(true);

    // Stop timer
    const stopRes = room.stopTimer(key.value);
    expect(stopRes.isOk).toBe(true);
    expect(room.currentRound.timer).toBeNull();

    // Start timer again and ensure revealCards clears it
    room.startTimer(key.value, 60);
    expect(room.currentRound.timer).not.toBeNull();
    room.revealCards(key.value);
    expect(room.currentRound.timer).toBeNull();
  });

  it('should support collaborative sticky notes with pinning, editing, moving, and round archiving', () => {
    const { room, key } = createTestRoom();

    // Import StickyNote
    const { StickyNote } = require('./entities/sticky-note.entity.js');

    // Add unpinned sticky note
    const note1 = StickyNote.create('note-1', {
      roomId: room.id,
      text: 'Need to clarify API rate limits',
      color: 'yellow',
      position: { x: 100, y: 200 },
      authorId: 'user-1',
      authorName: 'Alice',
      isPinned: false,
    });
    room.addStickyNote(note1);

    // Add pinned sticky note
    const note2 = StickyNote.create('note-2', {
      roomId: room.id,
      text: 'Definition of Done: unit tests required',
      color: 'blue',
      position: { x: -300, y: 150 },
      authorId: 'user-2',
      authorName: 'Bob',
      isPinned: true,
    });
    room.addStickyNote(note2);

    expect(room.stickyNotes.size).toBe(2);

    // Move note 1
    const moved = room.moveStickyNote('note-1', { x: 150, y: 250 });
    expect(moved).toBe(true);
    expect(room.stickyNotes.get('note-1')?.position).toEqual({ x: 150, y: 250 });

    // Edit note 1
    const edited = room.editStickyNote('note-1', 'Updated: API rate limits clarified', 'green');
    expect(edited).toBe(true);
    expect(room.stickyNotes.get('note-1')?.text).toBe('Updated: API rate limits clarified');
    expect(room.stickyNotes.get('note-1')?.color).toBe('green');

    // Soft lock editing state
    room.setStickyNoteEditing('note-1', { userId: 'user-1', userName: 'Alice' });
    expect(room.stickyNotes.get('note-1')?.editingBy?.userName).toBe('Alice');

    // Toggle pin on note 1
    const isPinned = room.togglePinStickyNote('note-1');
    expect(isPinned).toBe(true);
    expect(room.stickyNotes.get('note-1')?.isPinned).toBe(true);

    // Toggle back to unpinned
    room.togglePinStickyNote('note-1');
    expect(room.stickyNotes.get('note-1')?.isPinned).toBe(false);

    // Advance to next round
    const nextRes = room.nextRound(key.value, 'User Story 2');
    expect(nextRes.isOk).toBe(true);

    // Note 1 (unpinned) should be removed from active stickyNotes and archived in round 1
    expect(room.stickyNotes.has('note-1')).toBe(false);
    // Note 2 (pinned) must remain active
    expect(room.stickyNotes.has('note-2')).toBe(true);

    // Check round 1 archive
    const pastRound = room.roundsHistory[0];
    expect(pastRound.archivedStickyNotes.length).toBe(1);
    expect(pastRound.archivedStickyNotes[0].id).toBe('note-1');
    expect(pastRound.archivedStickyNotes[0].text).toBe('Updated: API rate limits clarified');
    expect(pastRound.archivedStickyNotes[0].position).toEqual({ x: 150, y: 250 });

    // Delete note 2
    const deleted = room.deleteStickyNote('note-2');
    expect(deleted).toBe(true);
    expect(room.stickyNotes.size).toBe(0);
  });
});
