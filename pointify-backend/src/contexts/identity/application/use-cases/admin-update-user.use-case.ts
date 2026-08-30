import { Injectable, Inject } from '@nestjs/common';
import { type Result, ok, fail } from '../../../../shared/domain/result.js';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user.repository.interface.js';
import { UserNotFoundError } from '../../domain/user.errors.js';
import { UserMapper } from '../../infrastructure/mappers/user.mapper.js';
import type {
  AdminUpdateUserInputDto,
  UserProfileDto,
} from '../dtos/user.dto.js';

@Injectable()
export class AdminUpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dto: AdminUpdateUserInputDto,
  ): Promise<Result<UserProfileDto, UserNotFoundError>> {
    const user = await this.userRepository.findByUid(dto.uid);
    if (!user) {
      return fail(new UserNotFoundError(dto.uid));
    }

    user.updateProfile({
      displayName: dto.displayName,
      photoURL: dto.photoURL,
      role: dto.role,
      status: dto.status,
    });

    await this.userRepository.save(user);

    return ok(UserMapper.toDto(user));
  }
}
