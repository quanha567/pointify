import { Inject, Injectable } from '@nestjs/common';
import { type IUserRepository, USER_REPOSITORY } from '../../domain/user.repository.interface.js';
import { UserNotFoundError } from '../../domain/user.errors.js';
import { UserMapper } from '../../infrastructure/mappers/user.mapper.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';
import type { UpdateProfileInputDto, UserProfileDto } from '../dtos/user.dto.js';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: UpdateProfileInputDto): Promise<Result<UserProfileDto, UserNotFoundError>> {
    const user = await this.userRepository.findByUid(input.uid);
    if (!user) {
      return fail(new UserNotFoundError(input.uid));
    }

    user.updateProfile({
      displayName: input.displayName,
      photoURL: input.photoURL,
    });

    await this.userRepository.save(user);
    return ok(UserMapper.toDto(user));
  }
}
