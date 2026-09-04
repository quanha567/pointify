import { Inject, Injectable } from '@nestjs/common';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { RoomNotFoundError, ParticipantNotFoundError } from '../../domain/room.errors.js';
import type { Room } from '../../domain/room.aggregate.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';

export interface SwitchRoleInputDto {
  roomId: string;
  participantId: string;
  isSpectator: boolean;
}

@Injectable()
export class SwitchRoleUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(
    input: SwitchRoleInputDto,
  ): Promise<Result<Room, RoomNotFoundError | ParticipantNotFoundError>> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      return fail(new RoomNotFoundError(input.roomId));
    }

    const switchResult = room.switchParticipantRole(input.participantId, input.isSpectator);
    if (switchResult.isFail) {
      return fail(switchResult.error);
    }

    await this.roomRepository.save(room);

    return ok(room);
  }
}
