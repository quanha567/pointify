import { Inject, Injectable } from '@nestjs/common';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { RoomNotFoundError } from '../../domain/room.errors.js';
import type { RoomProjection } from '../../domain/room.aggregate.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';

@Injectable()
export class GetRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(
    roomId: string,
    viewerParticipantId?: string,
  ): Promise<Result<RoomProjection, RoomNotFoundError>> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      return fail(new RoomNotFoundError(roomId));
    }
    return ok(room.toProjection(viewerParticipantId));
  }
}
