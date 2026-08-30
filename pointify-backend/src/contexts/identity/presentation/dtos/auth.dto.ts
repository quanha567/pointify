import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Firebase ID Token obtained from client SDK after authentication',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...’',
  })
  idToken!: string;
}

export class SessionUserDto {
  @ApiProperty({ example: 'w1234567890' })
  uid!: string;

  @ApiProperty({ example: 'dev@pointify.app', nullable: true })
  email!: string | null;

  @ApiProperty({ example: 'Scrum Master' })
  displayName!: string;

  @ApiProperty({ example: 'https://pointify.app/avatar.png', nullable: true })
  photoURL?: string | null;

  @ApiProperty({ example: 'password' })
  providerId!: string;

  @ApiProperty({ example: 'admin', enum: ['admin', 'member'] })
  role!: 'admin' | 'member';

  @ApiProperty({ example: 'active', enum: ['active', 'disabled'] })
  status!: 'active' | 'disabled';

  @ApiProperty({ example: 1725000000000 })
  createdAt!: number;

  @ApiProperty({ example: 1725000000000 })
  updatedAt!: number;

  @ApiProperty({ example: 1725000000000 })
  lastLoginAt!: number;
}

export class SessionResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: SessionUserDto })
  user!: SessionUserDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Logged out successfully' })
  message!: string;
}
