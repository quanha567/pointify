import { Injectable, Inject } from '@nestjs/common';
import { type Result, ok } from '../../../../shared/domain/result.js';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user.repository.interface.js';
import { UserNotFoundError } from '../../domain/user.errors.js';
import { UserMapper } from '../../infrastructure/mappers/user.mapper.js';
import type {
  ListUsersInputDto,
  ListUsersResultDto,
} from '../dtos/user.dto.js';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dto: ListUsersInputDto = {},
  ): Promise<Result<ListUsersResultDto, UserNotFoundError>> {
    const page = Math.max(1, dto.page || 1);
    const limit = Math.max(1, Math.min(100, dto.limit || 20));

    const { users, total } = await this.userRepository.findAll({
      page,
      limit,
      search: dto.search,
      role: dto.role,
      status: dto.status,
      providerId: dto.providerId,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
    });

    const userDtos = users.map((u) => UserMapper.toDto(u));
    const totalPages = Math.ceil(total / limit) || 1;

    return ok({
      users: userDtos,
      total,
      page,
      limit,
      totalPages,
    });
  }
}
