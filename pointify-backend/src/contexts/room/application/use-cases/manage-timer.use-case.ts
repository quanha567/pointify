import { Inject, Injectable } from '@nestjs/common';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { RoomNotFoundError, type UnauthorizedFacilitatorError } from '../../domain/room.errors.js';
import type { Room } from '../../domain/room.aggregate.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';
import type { ManageTimerInputDto } from '../dtos/room.dto.js';

@Injectable()
export class ManageTimerUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(
    input: ManageTimerInputDto,
  ): Promise<Result<Room, RoomNotFoundError | UnauthorizedFacilitatorError>> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      return fail(new RoomNotFoundError(input.roomId));
    }

    let actionResult: Result<void, UnauthorizedFacilitatorError>;

    switch (input.action) {
      case 'start': {
        const duration = input.durationSeconds && input.durationSeconds > 0 ? input.durationSeconds : 30;
        actionResult = room.startTimer(input.facilitatorKey, duration);
        break;
      }
      case 'pause': {
        actionResult = room.pauseTimer(input.facilitatorKey);
        break;
      }
      case 'resume': {
        actionResult = room.resumeTimer(input.facilitatorKey);
        break;
      }
      case 'stop': {
        actionResult = room.stopTimer(input.facilitatorKey);
        break;
      }
      case 'add_time': {
        const seconds = input.additionalSeconds && input.additionalSeconds > 0 ? input.additionalSeconds : 30;
        actionResult = room.addTimerSeconds(input.facilitatorKey, seconds);
        break;
      }
      default: {
        actionResult = ok(undefined);
      }
    }

    if (actionResult.isFail) {
      return fail(actionResult.error);
    }

    await this.roomRepository.save(room);

    return ok(room);
  }
}
