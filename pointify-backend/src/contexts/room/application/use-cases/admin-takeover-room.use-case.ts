import { Injectable, Inject } from '@nestjs/common';
import { type Result, ok, fail } from '../../../../shared/domain/result.js';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { RoomNotFoundError } from '../../domain/room.errors.js';
import type { AdminTakeoverResponseDto } from '../dtos/admin-room.dto.js';

@Injectable()
export class AdminTakeoverRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(roomId: string): Promise<Result<AdminTakeoverResponseDto, RoomNotFoundError>> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      return fail(new RoomNotFoundError(roomId));
    }

    return ok({
      roomId: room.id,
      facilitatorKey: room.facilitatorKey.value,
    });
  }
}
