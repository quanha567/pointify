import { Inject, Injectable } from '@nestjs/common';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { RoomNotFoundError, type UnauthorizedFacilitatorError } from '../../domain/room.errors.js';
import type { RoomProjection } from '../../domain/room.aggregate.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';
import type { RevealCardsInputDto } from '../dtos/room.dto.js';

@Injectable()
export class RevealCardsUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(
    input: RevealCardsInputDto,
  ): Promise<Result<RoomProjection, RoomNotFoundError | UnauthorizedFacilitatorError>> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      return fail(new RoomNotFoundError(input.roomId));
    }

    const revealResult = room.revealCards(input.facilitatorKey);
    if (revealResult.isFail) {
      return fail(revealResult.error);
    }

    await this.roomRepository.save(room);

    return ok(room.toProjection());
  }
}
