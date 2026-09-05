import { Inject, Injectable } from '@nestjs/common';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { RoomNotFoundError, type UnauthorizedFacilitatorError } from '../../domain/room.errors.js';
import type { RoomProjection } from '../../domain/room.aggregate.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';
import type { ResetRoundInputDto } from '../dtos/room.dto.js';

@Injectable()
export class ResetRoundUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(
    input: ResetRoundInputDto,
  ): Promise<Result<RoomProjection, RoomNotFoundError | UnauthorizedFacilitatorError>> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      return fail(new RoomNotFoundError(input.roomId));
    }

    const resetResult = room.resetRound(input.facilitatorKey);
    if (resetResult.isFail) {
      return fail(resetResult.error);
    }

    await this.roomRepository.save(room);

    return ok(room.toProjection());
  }
}
