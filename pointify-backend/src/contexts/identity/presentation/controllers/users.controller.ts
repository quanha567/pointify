import { Controller, Get, Patch, Body, Req, UnauthorizedException, Inject } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import '@fastify/cookie';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case.js';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case.js';
import {
  type IAuthService,
  AUTH_SERVICE,
} from '../../application/services/auth-service.interface.js';
import { UpdateProfileDto, UserProfileResponseDto } from '../dtos/users.dto.js';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@ApiCookieAuth('cookie')
@Controller('api/users')
export class UsersController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  private async getUidFromRequest(req: FastifyRequest): Promise<string> {
    const sessionCookie = req.cookies?.__session;
    const authHeader = req.headers.authorization;

    let idToken = '';
    if (sessionCookie) {
      idToken = sessionCookie;
    } else if (authHeader?.startsWith('Bearer ')) {
      idToken = authHeader.substring(7);
    }

    if (!idToken) {
      throw new UnauthorizedException('No authentication session found');
    }

    try {
      const decoded = await this.authService.verifyIdToken(idToken);
      return decoded.uid;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication session');
    }
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieves profile information of the authenticated user from token or session cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing session' })
  async getProfile(@Req() req: FastifyRequest): Promise<UserProfileResponseDto> {
    const uid = await this.getUidFromRequest(req);
    const result = await this.getUserProfileUseCase.execute(uid);

    if (result.isFail) {
      throw new UnauthorizedException(result.error.message);
    }

    return {
      success: true,
      user: result.value,
    };
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates displayName or photoURL for the authenticated user.',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing session' })
  async updateProfile(
    @Req() req: FastifyRequest,
    @Body() body: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    const uid = await this.getUidFromRequest(req);
    const result = await this.updateUserProfileUseCase.execute({
      uid,
      displayName: body.displayName,
      photoURL: body.photoURL,
    });

    if (result.isFail) {
      throw new UnauthorizedException(result.error.message);
    }

    return {
      success: true,
      user: result.value,
    };
  }
}
