import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminOverviewQueryDto {
  @ApiPropertyOptional({
    enum: ['7d', '30d', '90d', 'all'],
    default: '30d',
    description: 'Time range preset for metrics and trend series',
  })
  range?: '7d' | '30d' | '90d' | 'all';
}

export class OverviewSummaryDto {
  @ApiProperty({ example: 120 })
  totalAccounts!: number;

  @ApiProperty({ example: 110 })
  activeAccounts!: number;

  @ApiProperty({ example: 10 })
  disabledAccounts!: number;

  @ApiProperty({ example: 45 })
  totalRooms!: number;

  @ApiProperty({ example: 18 })
  activeRooms!: number;

  @ApiProperty({ example: 260 })
  totalRounds!: number;

  @ApiProperty({ example: 1420 })
  totalEstimates!: number;
}

export class ActivityTrendItemDto {
  @ApiProperty({ example: '2026-08-30' })
  date!: string;

  @ApiProperty({ example: 12 })
  accounts!: number;

  @ApiProperty({ example: 5 })
  rooms!: number;

  @ApiProperty({ example: 34 })
  rounds!: number;
}

export class DeckDistributionItemDto {
  @ApiProperty({ example: 'fibonacci' })
  deckType!: string;

  @ApiProperty({ example: 32 })
  count!: number;

  @ApiProperty({ example: 71.1 })
  percentage!: number;
}

export class RecentActivityItemDto {
  @ApiProperty({ example: 'act_123' })
  id!: string;

  @ApiProperty({ enum: ['user_registered', 'room_created'], example: 'room_created' })
  type!: 'user_registered' | 'room_created';

  @ApiProperty({ example: 'Sprint 42 Estimation' })
  title!: string;

  @ApiProperty({ example: 'Phòng mới tạo bởi John' })
  subtitle!: string;

  @ApiProperty({ example: 1725400000000 })
  timestamp!: number;
}

export class AdminOverviewResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: OverviewSummaryDto })
  summary!: OverviewSummaryDto;

  @ApiProperty({ type: [ActivityTrendItemDto] })
  trends!: ActivityTrendItemDto[];

  @ApiProperty({ type: [DeckDistributionItemDto] })
  deckDistribution!: DeckDistributionItemDto[];

  @ApiProperty({ type: [RecentActivityItemDto] })
  recentActivities!: RecentActivityItemDto[];
}
