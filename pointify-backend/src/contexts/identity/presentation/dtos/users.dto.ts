import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionUserDto } from './auth.dto.js';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'New display name for the user',
    example: 'John Scrum',
  })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'URL of the new avatar photo',
    example: 'https://pointify.app/avatars/john.png',
  })
  photoURL?: string;
}

export class UserProfileResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: SessionUserDto })
  user!: SessionUserDto;
}

export class AdminUserListQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  limit?: number;

  @ApiPropertyOptional({ description: 'Search term for name, email, or UID' })
  search?: string;

  @ApiPropertyOptional({ enum: ['admin', 'member'] })
  role?: 'admin' | 'member';

  @ApiPropertyOptional({ enum: ['active', 'disabled'] })
  status?: 'active' | 'disabled';

  @ApiPropertyOptional({ description: 'Filter by provider ID (e.g. google.com, password, anonymous)' })
  providerId?: string;

  @ApiPropertyOptional({ enum: ['createdAt', 'displayName', 'lastLoginAt', 'email'], default: 'createdAt' })
  sortBy?: 'createdAt' | 'displayName' | 'lastLoginAt' | 'email';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  sortOrder?: 'asc' | 'desc';
}

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'Jane Admin' })
  displayName?: string;

  @ApiPropertyOptional({ example: 'https://pointify.app/avatars/jane.png' })
  photoURL?: string | null;

  @ApiPropertyOptional({ enum: ['admin', 'member'] })
  role?: 'admin' | 'member';

  @ApiPropertyOptional({ enum: ['active', 'disabled'] })
  status?: 'active' | 'disabled';
}

export class AdminUserListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: [SessionUserDto] })
  users!: SessionUserDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

