import { Injectable, Inject } from '@nestjs/common';
import { type Result, ok, fail } from '../../../../shared/domain/result.js';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user.repository.interface.js';
import {
  type IAuthService,
  AUTH_SERVICE,
} from '../services/auth-service.interface.js';
import { User } from '../../domain/user.entity.js';
import { UserMapper } from '../../infrastructure/mappers/user.mapper.js';
import type {
  AdminCreateUserInputDto,
  UserProfileDto,
} from '../dtos/user.dto.js';

@Injectable()
export class AdminCreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  async execute(
    dto: AdminCreateUserInputDto,
  ): Promise<Result<UserProfileDto, Error>> {
    try {
      if (!dto.email || !dto.email.includes('@')) {
        return fail(new Error('Valid email address is required'));
      }

      if (!dto.displayName || dto.displayName.trim().length === 0) {
        return fail(new Error('Display name is required'));
      }

      const createdAuth = await this.authService.createUser({
        email: dto.email.trim().toLowerCase(),
        displayName: dto.displayName.trim(),
        photoURL: dto.photoURL || null,
        password: dto.password,
      });

      const user = User.create(createdAuth.uid, {
        email: createdAuth.email,
        displayName: createdAuth.displayName,
        photoURL: createdAuth.photoURL,
        role: dto.role || 'member',
        status: dto.status || 'active',
        providerId: 'password',
      });

      await this.userRepository.save(user);

      return ok(UserMapper.toDto(user));
    } catch (err: any) {
      return fail(new Error(err?.message || 'Failed to create user account'));
    }
  }
}
