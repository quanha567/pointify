import { Inject, Injectable } from '@nestjs/common';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { Participant } from '../../domain/entities/participant.entity.js';
import { RoomNotFoundError } from '../../domain/room.errors.js';
import type { RoomProjection } from '../../domain/room.aggregate.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';
import type { JoinRoomInputDto } from '../dtos/room.dto.js';

@Injectable()
export class JoinRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(input: JoinRoomInputDto): Promise<Result<RoomProjection, RoomNotFoundError>> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      return fail(new RoomNotFoundError(input.roomId));
    }

    const participant = Participant.create(input.participant.id, {
      displayName: input.participant.displayName,
      photoURL: input.participant.photoURL,
      isGuest: input.participant.isGuest ?? true,
      isSpectator: input.participant.isSpectator ?? false,
      isOnline: true,
    });

    room.join(participant);
    await this.roomRepository.save(room);

    return ok(room.toProjection(input.participant.id));
  }
}
