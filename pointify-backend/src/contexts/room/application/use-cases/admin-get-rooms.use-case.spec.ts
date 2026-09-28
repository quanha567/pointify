import { describe, it, expect, vi } from 'vitest';
import { AdminGetRoomsUseCase } from './admin-get-rooms.use-case.js';
import { Room } from '../../domain/room.aggregate.js';
import { Participant } from '../../domain/entities/participant.entity.js';
import { Deck } from '../../domain/value-objects/deck.vo.js';
import type { IRoomRepository } from '../../domain/room.repository.interface.js';

describe('AdminGetRoomsUseCase', () => {
  const createMockRoom = (id: string, name: string, status: 'active' | 'closed' = 'active') => {
    const facilitator = Participant.create('user-1', { displayName: 'Host Alice', isOnline: true });
    const participant = Participant.create('user-2', { displayName: 'Bob', isOnline: false });
    const room = Room.create({
      id,
      name,
      facilitator,
      deck: Deck.fibonacci(),
    });
    room.join(participant);
    if (status === 'closed') {
      room.close();
    }
    return room;
  };

  it('should return paginated rooms and mapping correctly', () => {
    const room1 = createMockRoom('room-1', 'Sprint 10');
    const room2 = createMockRoom('room-2', 'Sprint 11', 'closed');

    const mockRepo: IRoomRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn().mockResolvedValue({
        rooms: [room1, room2],
        total: 2,
      }),
      bulkClose: vi.fn(),
      bulkDelete: vi.fn(),
    };

    const useCase = new AdminGetRoomsUseCase(mockRepo);
    return useCase.execute({ page: 1, limit: 10 }).then((res) => {
      expect(res.isOk).toBe(true);
      if (res.isOk) {
        expect(res.value.total).toBe(2);
        expect(res.value.items.length).toBe(2);
        expect(res.value.items[0].id).toBe('room-1');
        expect(res.value.items[0].facilitatorName).toBe('Host Alice');
        expect(res.value.items[0].participantCount).toBe(2);
        expect(res.value.items[0].onlineCount).toBe(1);
        expect(res.value.items[0].status).toBe('active');
        expect(res.value.items[1].status).toBe('closed');
      }
    });
  });
});
