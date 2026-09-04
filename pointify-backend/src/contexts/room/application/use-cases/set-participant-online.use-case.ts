import { Inject, Injectable } from '@nestjs/common';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { RoomNotFoundError } from '../../domain/room.errors.js';
import type { Room } from '../../domain/room.aggregate.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';

export interface SetParticipantOnlineInputDto {
  roomId: string;
  participantId: string;
  isOnline: boolean;
}

@Injectable()
export class SetParticipantOnlineUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(input: SetParticipantOnlineInputDto): Promise<Result<Room, RoomNotFoundError>> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      return fail(new RoomNotFoundError(input.roomId));
    }

    room.setParticipantOnline(input.participantId, input.isOnline);
    await this.roomRepository.save(room);

    return ok(room);
  }
}
