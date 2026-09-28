import { Injectable, Inject } from '@nestjs/common';
import { type Result, ok, fail } from '../../../../shared/domain/result.js';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { RoomNotFoundError } from '../../domain/room.errors.js';
import type { RoomProjection } from '../../domain/room.aggregate.js';

@Injectable()
export class AdminCloseRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(roomId: string): Promise<Result<RoomProjection, RoomNotFoundError>> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      return fail(new RoomNotFoundError(roomId));
    }

    room.close();
    await this.roomRepository.save(room);

    return ok(room.toProjection());
  }
}
