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
});
