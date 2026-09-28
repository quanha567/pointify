import { Injectable, Inject } from '@nestjs/common';
import { type Result, ok } from '../../../../shared/domain/result.js';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import type {
  AdminGetRoomsQueryDto,
  AdminGetRoomsResponseDto,
  AdminRoomListItemDto,
} from '../dtos/admin-room.dto.js';

@Injectable()
export class AdminGetRoomsUseCase {
  private static readonly STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(dto: AdminGetRoomsQueryDto = {}): Promise<Result<AdminGetRoomsResponseDto, never>> {
    const page = Math.max(1, dto.page || 1);
    const limit = Math.max(1, Math.min(100, dto.limit || 20));

    const { rooms, total } = await this.roomRepository.findAll({
      page,
      limit,
      search: dto.search,
      status: dto.status,
      deckType: dto.deckType,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
    });

    const now = Date.now();
    const items: AdminRoomListItemDto[] = rooms.map((room) => {
      const facilitator = room.participants.get(room.facilitatorId);
      const onlineCount = Array.from(room.participants.values()).filter((p) => p.isOnline).length;
      const isStale =
        room.status === 'active' && now - room.updatedAt > AdminGetRoomsUseCase.STALE_THRESHOLD_MS;

      return {
        id: room.id,
        name: room.name,
        facilitatorId: room.facilitatorId,
        facilitatorName: facilitator?.displayName || 'Unknown',
        deckType: room.deck.type,
        participantCount: room.participants.size,
        onlineCount,
        currentRoundNumber: room.currentRound.roundNumber,
        currentRoundStatus: room.currentRound.status,
        totalRounds: room.roundsHistory.length + 1,
        status: room.status,
        isStale,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return ok({
      items,
      total,
      page,
      limit,
      totalPages,
    });
  }
}
