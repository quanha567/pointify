import { Injectable, Inject } from '@nestjs/common';
import { type Result, ok, fail } from '../../../../shared/domain/result.js';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user.repository.interface.js';
import type {
  AdminBulkUpdateStatusInputDto,
  AdminBulkUpdateStatusResultDto,
} from '../dtos/user.dto.js';

@Injectable()
export class AdminBulkUpdateStatusUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dto: AdminBulkUpdateStatusInputDto,
  ): Promise<Result<AdminBulkUpdateStatusResultDto, Error>> {
    try {
      if (!dto.uids || !Array.isArray(dto.uids) || dto.uids.length === 0) {
        return ok({ success: true, updatedCount: 0 });
      }

      // Self-protection guardrail: Do not allow current admin to modify their own status
      const targetUids = dto.currentAdminUid
        ? dto.uids.filter((uid) => uid !== dto.currentAdminUid)
        : dto.uids;

      if (targetUids.length === 0) {
        return ok({ success: true, updatedCount: 0 });
      }

      const updatedCount = await this.userRepository.bulkUpdateStatus(
        targetUids,
        dto.status,
      );

      return ok({
        success: true,
        updatedCount,
      });
    } catch (err: any) {
      return fail(new Error(err?.message || 'Failed to bulk update users status'));
    }
  }
}
