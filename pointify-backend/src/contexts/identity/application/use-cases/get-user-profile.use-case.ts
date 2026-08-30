import { Inject, Injectable } from '@nestjs/common';
import { type IUserRepository, USER_REPOSITORY } from '../../domain/user.repository.interface.js';
import { UserNotFoundError } from '../../domain/user.errors.js';
import { UserMapper } from '../../infrastructure/mappers/user.mapper.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';
import type { UserProfileDto } from '../dtos/user.dto.js';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(uid: string): Promise<Result<UserProfileDto, UserNotFoundError>> {
    const user = await this.userRepository.findByUid(uid);
    if (!user) {
      return fail(new UserNotFoundError(uid));
    }
    return ok(UserMapper.toDto(user));
  }
}
