import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { GetAdminOverviewUseCase } from '../../application/use-cases/get-admin-overview.use-case.js';
import { AdminAuthGuard } from '../../../identity/presentation/guards/admin-auth.guard.js';
import {
  AdminOverviewQueryDto,
  AdminOverviewResponseDto,
} from '../dtos/admin-overview.dto.js';

@ApiTags('Admin / Analytics')
@ApiBearerAuth('bearer')
@ApiCookieAuth('cookie')
@UseGuards(AdminAuthGuard)
@Controller('api/admin/overview')
export class AdminOverviewController {
  constructor(private readonly getAdminOverviewUseCase: GetAdminOverviewUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Get system analytics overview for admin',
    description: 'Returns aggregated KPI summaries, time-series trends, deck distribution, and recent activities.',
  })
  @ApiResponse({
    status: 200,
    description: 'System overview retrieved successfully',
    type: AdminOverviewResponseDto,
  })
  async getOverview(@Query() query: AdminOverviewQueryDto): Promise<AdminOverviewResponseDto> {
    return this.getAdminOverviewUseCase.execute(query.range || '30d');
  }
}
