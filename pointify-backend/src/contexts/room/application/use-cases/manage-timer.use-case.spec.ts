import { describe, it, expect, beforeEach } from 'vitest';
import { ManageTimerUseCase } from './manage-timer.use-case.js';
import { Room } from '../../domain/room.aggregate.js';
import { Participant } from '../../domain/entities/participant.entity.js';
import { Deck } from '../../domain/value-objects/deck.vo.js';
import { FacilitatorKey } from '../../domain/value-objects/facilitator-key.vo.js';
import type { IRoomRepository } from '../../domain/room.repository.interface.js';

describe('ManageTimerUseCase', () => {
  let useCase: ManageTimerUseCase;
  let mockRepo: IRoomRepository;
  let room: Room;
  let key: FacilitatorKey;

  beforeEach(() => {
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
      save: async () => {},
      delete: async () => {},
    };

    useCase = new ManageTimerUseCase(mockRepo);
  });

  it('should start timer successfully and return projection with timer', async () => {
    const result = await useCase.execute({
      roomId: 'room-1',
      facilitatorKey: key.value,
      action: 'start',
      durationSeconds: 60,
    });

    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.currentRound.timer).not.toBeNull();
      expect(result.value.currentRound.timer?.durationSeconds).toBe(60);
      expect(result.value.currentRound.timer?.status).toBe('running');
    }
  });

  it('should pause, resume, and stop timer successfully', async () => {
    await useCase.execute({
      roomId: 'room-1',
      facilitatorKey: key.value,
      action: 'start',
      durationSeconds: 60,
    });

    const pauseRes = await useCase.execute({
      roomId: 'room-1',
      facilitatorKey: key.value,
      action: 'pause',
    });
    expect(pauseRes.isOk).toBe(true);
    expect(pauseRes.value.currentRound.timer?.status).toBe('paused');

    const resumeRes = await useCase.execute({
      roomId: 'room-1',
      facilitatorKey: key.value,
      action: 'resume',
    });
    expect(resumeRes.isOk).toBe(true);
    expect(resumeRes.value.currentRound.timer?.status).toBe('running');

    const stopRes = await useCase.execute({
      roomId: 'room-1',
      facilitatorKey: key.value,
      action: 'stop',
    });
    expect(stopRes.isOk).toBe(true);
    expect(stopRes.value.currentRound.timer).toBeNull();
  });

  it('should reject when facilitator key is invalid', async () => {
    const result = await useCase.execute({
      roomId: 'room-1',
      facilitatorKey: 'invalid-key',
      action: 'start',
      durationSeconds: 60,
    });

    expect(result.isFail).toBe(true);
  });
});
