import { Injectable, Inject } from '@nestjs/common';
import { type Result, ok } from '../../../../shared/domain/result.js';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import type { AdminBulkRoomActionResultDto } from '../dtos/admin-room.dto.js';

@Injectable()
export class AdminBulkCloseRoomsUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(roomIds: string[]): Promise<Result<AdminBulkRoomActionResultDto, never>> {
    const count = await this.roomRepository.bulkClose(roomIds);
    return ok({ success: true, count });
  }
}

@Injectable()
export class AdminBulkDeleteRoomsUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(roomIds: string[]): Promise<Result<AdminBulkRoomActionResultDto, never>> {
    const count = await this.roomRepository.bulkDelete(roomIds);
    return ok({ success: true, count });
  }
}
