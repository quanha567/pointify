import { Inject, Injectable } from '@nestjs/common';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { RoomNotFoundError, type CannotClaimFacilitatorError } from '../../domain/room.errors.js';
import type { RoomProjection } from '../../domain/room.aggregate.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';
import type { ClaimFacilitatorInputDto } from '../dtos/room.dto.js';

export interface ClaimFacilitatorResultDto {
  room: RoomProjection;
  newFacilitatorKey: string;
}

@Injectable()
export class ClaimFacilitatorUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(
    input: ClaimFacilitatorInputDto,
  ): Promise<Result<ClaimFacilitatorResultDto, RoomNotFoundError | CannotClaimFacilitatorError>> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      return fail(new RoomNotFoundError(input.roomId));
    }

    const claimResult = room.claimFacilitator(input.claimantId);
    if (claimResult.isFail) {
      return fail(claimResult.error);
    }

    await this.roomRepository.save(room);

    return ok({
      room: room.toProjection(input.claimantId),
      newFacilitatorKey: claimResult.value.value,
    });
  }
}
