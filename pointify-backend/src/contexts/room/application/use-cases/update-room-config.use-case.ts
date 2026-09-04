import { Inject, Injectable } from '@nestjs/common';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { RoomNotFoundError, type UnauthorizedFacilitatorError } from '../../domain/room.errors.js';
import { Deck } from '../../domain/value-objects/deck.vo.js';
import type { Room } from '../../domain/room.aggregate.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';
import type { UpdateRoomConfigInputDto } from '../dtos/room.dto.js';

@Injectable()
export class UpdateRoomConfigUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(
    input: UpdateRoomConfigInputDto,
  ): Promise<
    Result<
      { room: Room; clearedVotes: boolean },
      RoomNotFoundError | UnauthorizedFacilitatorError
    >
  > {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      return fail(new RoomNotFoundError(input.roomId));
    }

    const updates: { name?: string; deck?: Deck } = {};

    if (input.name !== undefined) {
      updates.name = input.name;
    }

    if (input.deckType !== undefined) {
      updates.deck = Deck.fromType(input.deckType, input.customCards);
    }

    const updateResult = room.updateConfig(input.facilitatorKey, updates);
    if (updateResult.isFail) {
      return fail(updateResult.error);
    }

    await this.roomRepository.save(room);

    return ok({
      room,
      clearedVotes: updateResult.value.clearedVotes,
    });
  }
}
