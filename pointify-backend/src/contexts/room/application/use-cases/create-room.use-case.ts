import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { Room } from '../../domain/room.aggregate.js';
import { Participant } from '../../domain/entities/participant.entity.js';
import { Deck } from '../../domain/value-objects/deck.vo.js';
import { FacilitatorKey } from '../../domain/value-objects/facilitator-key.vo.js';
import { RoomCode } from '../../domain/value-objects/room-code.vo.js';
import { ok, type Result } from '../../../../shared/domain/result.js';
import type { CreateRoomInputDto, CreateRoomResultDto } from '../dtos/room.dto.js';

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(input: CreateRoomInputDto): Promise<Result<CreateRoomResultDto, Error>> {
    let roomId = '';
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
      const candidateCode = RoomCode.generate().value;
      const existing = await this.roomRepository.findById(candidateCode);
      if (!existing) {
        roomId = candidateCode;
        break;
      }
    }

    if (!roomId) {
      roomId = RoomCode.generate().value;
    }

    const facilitatorId = input.facilitator.id || crypto.randomUUID();

    const facilitator = Participant.create(facilitatorId, {
      displayName: input.facilitator.displayName,
      photoURL: input.facilitator.photoURL,
      isGuest: input.facilitator.isGuest ?? true,
      isSpectator: false,
      isOnline: true,
    });

    const deck = Deck.fromType(input.deckType || 'fibonacci', input.customCards);
    const facilitatorKey = FacilitatorKey.generate();

    const room = Room.create({
      id: roomId,
      name: input.name,
      facilitator,
      deck,
      facilitatorKey,
    });

    await this.roomRepository.save(room);

    return ok({
      room: room.toProjection(facilitatorId),
      facilitatorKey: facilitatorKey.value,
    });
  }
}
