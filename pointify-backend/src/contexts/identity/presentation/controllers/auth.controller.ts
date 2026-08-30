import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import '@fastify/cookie';
import { SyncSessionUserUseCase } from '../../application/use-cases/sync-session-user.use-case.js';
import { CreateSessionDto, SessionResponseDto, LogoutResponseDto } from '../dtos/auth.dto.js';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly syncSessionUserUseCase: SyncSessionUserUseCase) {}

  @Post('session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exchange Firebase ID token for session cookie',
    description:
      'Verifies Firebase ID token, syncs user profile in database, and sets __session HTTP-only cookie.',
  })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({
    status: 200,
    description: 'Session created successfully',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired Firebase ID token' })
  async createSession(
    @Body() body: CreateSessionDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<SessionResponseDto> {
    const result = await this.syncSessionUserUseCase.execute({ idToken: body.idToken });

    if (result.isFail) {
      throw new UnauthorizedException(result.error.message);
    }

    reply.setCookie('__session', body.idToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 5, // 5 days
    });

    return {
      success: true,
      user: result.value,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log out and clear session cookie',
    description: 'Clears the __session HTTP-only cookie.',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully', type: LogoutResponseDto })
  async logout(@Res({ passthrough: true }) reply: FastifyReply): Promise<LogoutResponseDto> {
    reply.clearCookie('__session', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
