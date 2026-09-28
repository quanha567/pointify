import { Injectable, Inject } from '@nestjs/common';
import { type Result, ok, fail } from '../../../../shared/domain/result.js';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { RoomNotFoundError } from '../../domain/room.errors.js';

@Injectable()
export class AdminDeleteRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(roomId: string): Promise<Result<{ id: string; deleted: boolean }, RoomNotFoundError>> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      return fail(new RoomNotFoundError(roomId));
    }

    await this.roomRepository.delete(roomId);
    return ok({ id: roomId, deleted: true });
  }
}
