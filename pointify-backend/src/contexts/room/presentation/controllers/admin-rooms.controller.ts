import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
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
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../../../identity/presentation/guards/admin-auth.guard.js';
import { AdminGetRoomsUseCase } from '../../application/use-cases/admin-get-rooms.use-case.js';
import { AdminCloseRoomUseCase } from '../../application/use-cases/admin-close-room.use-case.js';
import { AdminDeleteRoomUseCase } from '../../application/use-cases/admin-delete-room.use-case.js';
import { AdminTakeoverRoomUseCase } from '../../application/use-cases/admin-takeover-room.use-case.js';
import {
  AdminBulkCloseRoomsUseCase,
  AdminBulkDeleteRoomsUseCase,
} from '../../application/use-cases/admin-bulk-room-actions.use-case.js';
import { GetRoomUseCase } from '../../application/use-cases/get-room.use-case.js';
import type {
  AdminGetRoomsQueryDto,
  AdminGetRoomsResponseDto,
  AdminTakeoverResponseDto,
  AdminBulkRoomActionDto,
  AdminBulkRoomActionResultDto,
} from '../../application/dtos/admin-room.dto.js';

@ApiTags('Admin / Rooms')
@ApiBearerAuth('bearer')
@ApiCookieAuth('cookie')
@UseGuards(AdminAuthGuard)
@Controller('api/admin/rooms')
export class AdminRoomsController {
  constructor(
    private readonly adminGetRoomsUseCase: AdminGetRoomsUseCase,
    private readonly adminCloseRoomUseCase: AdminCloseRoomUseCase,
    private readonly adminDeleteRoomUseCase: AdminDeleteRoomUseCase,
    private readonly adminTakeoverRoomUseCase: AdminTakeoverRoomUseCase,
    private readonly adminBulkCloseRoomsUseCase: AdminBulkCloseRoomsUseCase,
    private readonly adminBulkDeleteRoomsUseCase: AdminBulkDeleteRoomsUseCase,
    private readonly getRoomUseCase: GetRoomUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List estimation rooms for admin',
    description: 'Returns paginated, searchable, and filterable list of all estimation rooms.',
  })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
  async getRooms(@Query() query: AdminGetRoomsQueryDto): Promise<AdminGetRoomsResponseDto> {
    const result = await this.adminGetRoomsUseCase.execute(query);
    return result.value;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get room details for admin inspection',
  })
  @ApiParam({ name: 'id', description: 'Unique Room ID / Code' })
  @ApiResponse({ status: 200, description: 'Room details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getRoomDetail(@Param('id') id: string) {
    const result = await this.getRoomUseCase.execute(id);
    if (result.isFail) {
      throw new NotFoundException(result.error.message);
    }
    return {
      success: true,
      room: result.value,
    };
  }

  @Post(':id/close')
  @ApiOperation({
    summary: 'Force close an estimation room',
  })
  @ApiParam({ name: 'id', description: 'Unique Room ID / Code' })
  @ApiResponse({ status: 200, description: 'Room closed successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async closeRoom(@Param('id') id: string) {
    const result = await this.adminCloseRoomUseCase.execute(id);
    if (result.isFail) {
      throw new NotFoundException(result.error.message);
    }
    return {
      success: true,
      room: result.value,
    };
  }

  @Post(':id/takeover')
  @ApiOperation({
    summary: 'Claim facilitator key as super admin',
  })
  @ApiParam({ name: 'id', description: 'Unique Room ID / Code' })
  @ApiResponse({ status: 200, description: 'Facilitator key retrieved for admin takeover' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async takeoverRoom(@Param('id') id: string): Promise<{ success: boolean; data: AdminTakeoverResponseDto }> {
    const result = await this.adminTakeoverRoomUseCase.execute(id);
    if (result.isFail) {
      throw new NotFoundException(result.error.message);
    }
    return {
      success: true,
      data: result.value,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an estimation room',
  })
  @ApiParam({ name: 'id', description: 'Unique Room ID / Code' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async deleteRoom(@Param('id') id: string) {
    const result = await this.adminDeleteRoomUseCase.execute(id);
    if (result.isFail) {
      throw new NotFoundException(result.error.message);
    }
    return {
      success: true,
      id,
    };
  }

  @Post('bulk-close')
  @ApiOperation({
    summary: 'Bulk close estimation rooms',
  })
  @ApiResponse({ status: 200, description: 'Rooms bulk closed successfully' })
  async bulkClose(@Body() body: AdminBulkRoomActionDto): Promise<AdminBulkRoomActionResultDto> {
    if (!body.roomIds || !Array.isArray(body.roomIds)) {
      throw new BadRequestException('roomIds array is required');
    }
    const result = await this.adminBulkCloseRoomsUseCase.execute(body.roomIds);
    return result.value;
  }

  @Post('bulk-delete')
  @ApiOperation({
    summary: 'Bulk delete estimation rooms',
  })
  @ApiResponse({ status: 200, description: 'Rooms bulk deleted successfully' })
  async bulkDelete(@Body() body: AdminBulkRoomActionDto): Promise<AdminBulkRoomActionResultDto> {
    if (!body.roomIds || !Array.isArray(body.roomIds)) {
      throw new BadRequestException('roomIds array is required');
    }
    const result = await this.adminBulkDeleteRoomsUseCase.execute(body.roomIds);
    return result.value;
  }
}
