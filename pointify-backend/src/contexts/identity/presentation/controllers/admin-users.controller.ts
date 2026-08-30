import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case.js';
import { AdminUpdateUserUseCase } from '../../application/use-cases/admin-update-user.use-case.js';
import {
  AdminUserListQueryDto,
  AdminUpdateUserDto,
  AdminUserListResponseDto,
  UserProfileResponseDto,
} from '../dtos/users.dto.js';

@ApiTags('Admin / Users')
@ApiBearerAuth('bearer')
@ApiCookieAuth('cookie')
@Controller('api/admin/users')
export class AdminUsersController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly adminUpdateUserUseCase: AdminUpdateUserUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List user accounts for admin',
    description: 'Returns paginated, searchable, and filterable list of all registered accounts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: AdminUserListResponseDto,
  })
  async listUsers(
    @Query() query: AdminUserListQueryDto,
  ): Promise<AdminUserListResponseDto> {
    const result = await this.listUsersUseCase.execute({
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
      search: query.search,
      role: query.role,
      status: query.status,
      providerId: query.providerId,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    if (result.isFail) {
      throw new NotFoundException(result.error.message);
    }

    return {
      success: true,
      users: result.value.users,
      total: result.value.total,
      page: result.value.page,
      limit: result.value.limit,
      totalPages: result.value.totalPages,
    };
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Update user account as admin',
    description: 'Allows an administrator to modify profile details, status, and role of any account.',
  })
  @ApiParam({ name: 'uid', description: 'User unique identifier' })
  @ApiBody({ type: AdminUpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('uid') uid: string,
    @Body() body: AdminUpdateUserDto,
  ): Promise<UserProfileResponseDto> {
    const result = await this.adminUpdateUserUseCase.execute({
      uid,
      displayName: body.displayName,
      photoURL: body.photoURL,
      role: body.role,
      status: body.status,
    });

    if (result.isFail) {
      throw new NotFoundException(result.error.message);
    }

    return {
      success: true,
      user: result.value,
    };
  }
}
