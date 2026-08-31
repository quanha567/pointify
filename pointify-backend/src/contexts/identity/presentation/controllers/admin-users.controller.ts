import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
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
import { AdminCreateUserUseCase } from '../../application/use-cases/admin-create-user.use-case.js';
import { AdminBulkUpdateStatusUseCase } from '../../application/use-cases/admin-bulk-update-status.use-case.js';
import {
  AdminAuthGuard,
  type AuthenticatedAdminRequest,
} from '../guards/admin-auth.guard.js';
import {
  AdminUserListQueryDto,
  AdminUpdateUserDto,
  AdminCreateUserDto,
  AdminBulkUpdateStatusDto,
  AdminBulkUpdateStatusResponseDto,
  AdminUserListResponseDto,
  UserProfileResponseDto,
} from '../dtos/users.dto.js';

@ApiTags('Admin / Users')
@ApiBearerAuth('bearer')
@ApiCookieAuth('cookie')
@UseGuards(AdminAuthGuard)
@Controller('api/admin/users')
export class AdminUsersController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly adminUpdateUserUseCase: AdminUpdateUserUseCase,
    private readonly adminCreateUserUseCase: AdminCreateUserUseCase,
    private readonly adminBulkUpdateStatusUseCase: AdminBulkUpdateStatusUseCase,
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

  @Post()
  @ApiOperation({
    summary: 'Create a new user account as admin',
    description: 'Creates a new user record in Firebase Auth and persists profile in Firestore.',
  })
  @ApiBody({ type: AdminCreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserProfileResponseDto,
  })
  async createUser(
    @Body() body: AdminCreateUserDto,
  ): Promise<UserProfileResponseDto> {
    const result = await this.adminCreateUserUseCase.execute({
      email: body.email,
      displayName: body.displayName,
      photoURL: body.photoURL,
      role: body.role,
      status: body.status,
    });

    if (result.isFail) {
      throw new BadRequestException(result.error.message);
    }

    return {
      success: true,
      user: result.value,
    };
  }

  @Patch('bulk-status')
  @ApiOperation({
    summary: 'Bulk update user status as admin',
    description: 'Updates status of multiple user accounts in an atomic batch write operation.',
  })
  @ApiBody({ type: AdminBulkUpdateStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Bulk update processed successfully',
    type: AdminBulkUpdateStatusResponseDto,
  })
  async bulkUpdateStatus(
    @Body() body: AdminBulkUpdateStatusDto,
    @Req() req: AuthenticatedAdminRequest,
  ): Promise<AdminBulkUpdateStatusResponseDto> {
    const currentAdminUid = req.adminUser?.uid;

    const result = await this.adminBulkUpdateStatusUseCase.execute({
      uids: body.uids,
      status: body.status,
      currentAdminUid,
    });

    if (result.isFail) {
      throw new BadRequestException(result.error.message);
    }

    return {
      success: true,
      updatedCount: result.value.updatedCount,
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
    @Req() req: AuthenticatedAdminRequest,
  ): Promise<UserProfileResponseDto> {
    const currentAdminUid = req.adminUser?.uid;

    // Self-protection guardrail: Do not allow admin to disable or demote themselves
    if (currentAdminUid === uid) {
      if (body.status === 'disabled') {
        throw new BadRequestException('Không thể tự khóa tài khoản quản trị của chính mình');
      }
      if (body.role === 'member') {
        throw new BadRequestException('Không thể tự hạ quyền quản trị của chính mình');
      }
    }

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
