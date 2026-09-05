import { describe, it, expect, beforeEach } from 'vitest';
import { ResetRoundUseCase } from './reset-round.use-case.js';
import { Room } from '../../domain/room.aggregate.js';
import { Participant } from '../../domain/entities/participant.entity.js';
import { Deck } from '../../domain/value-objects/deck.vo.js';
import { FacilitatorKey } from '../../domain/value-objects/facilitator-key.vo.js';
import type { IRoomRepository } from '../../domain/room.repository.interface.js';

describe('ResetRoundUseCase', () => {
  let useCase: ResetRoundUseCase;
  let mockRepo: IRoomRepository;
  let room: Room;
  let key: FacilitatorKey;
  let saved = false;

  beforeEach(() => {
    saved = false;
    key = FacilitatorKey.generate();
    const facilitator = Participant.create('user-1', {
      displayName: 'Facilitator User',
      isGuest: false,
    });
    room = Room.create({
      id: 'room-1',
      name: 'Test Room',
      facilitator,
      deck: Deck.fibonacci(),
      facilitatorKey: key,
    });

    mockRepo = {
      findById: async (id: string) => (id === 'room-1' ? room : null),
      save: async () => {
        saved = true;
      },
      delete: async () => {},
    };

    useCase = new ResetRoundUseCase(mockRepo);
  });

  it('should reset current round successfully and save room', async () => {
    room.submitEstimate('user-1', 5);
    room.revealCards(key.value);
    expect(room.currentRound.status).toBe('revealed');

    const result = await useCase.execute({
      roomId: 'room-1',
      facilitatorKey: key.value,
    });

    expect(result.isOk).toBe(true);
    expect(saved).toBe(true);
    if (result.isOk) {
      expect(result.value.currentRound.roundNumber).toBe(1);
      expect(result.value.currentRound.status).toBe('voting');
      expect(result.value.currentRound.statistics).toBeNull();
      const p = result.value.participants.find((x) => x.id === 'user-1');
      expect(p?.hasEstimated).toBe(false);
      expect(p?.estimatedValue).toBeNull();
    }
  });

  it('should reject when facilitator key is invalid', async () => {
    const result = await useCase.execute({
      roomId: 'room-1',
      facilitatorKey: 'invalid-key',
    });

    expect(result.isFail).toBe(true);
    if (result.isFail) {
      expect(result.error.code).toBe('UNAUTHORIZED_FACILITATOR');
    }
    expect(saved).toBe(false);
  });

  it('should return error if room not found', async () => {
    const result = await useCase.execute({
      roomId: 'non-existent',
      facilitatorKey: key.value,
    });

    expect(result.isFail).toBe(true);
    if (result.isFail) {
      expect(result.error.code).toBe('ROOM_NOT_FOUND');
    }
  });
});
