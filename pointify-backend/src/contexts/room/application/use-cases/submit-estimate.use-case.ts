import { Inject, Injectable } from '@nestjs/common';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import {
  RoomNotFoundError,
  type ParticipantNotFoundError,
  type InvalidCardValueError,
  type RoundAlreadyRevealedError,
} from '../../domain/room.errors.js';
import type { RoomProjection } from '../../domain/room.aggregate.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';
import type { SubmitEstimateInputDto } from '../dtos/room.dto.js';

@Injectable()
export class SubmitEstimateUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(
    input: SubmitEstimateInputDto,
  ): Promise<
    Result<
      RoomProjection,
      | RoomNotFoundError
      | ParticipantNotFoundError
      | InvalidCardValueError
      | RoundAlreadyRevealedError
    >
  > {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      return fail(new RoomNotFoundError(input.roomId));
    }

    const estimateResult = room.submitEstimate(input.participantId, input.cardValue);
    if (estimateResult.isFail) {
      return fail(estimateResult.error);
    }

    await this.roomRepository.save(room);

    return ok(room.toProjection(input.participantId));
  }
}
