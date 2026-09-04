import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import '@fastify/cookie';
import {
  type IAuthService,
  AUTH_SERVICE,
} from '../../application/services/auth-service.interface.js';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user.repository.interface.js';
import type { User } from '../../domain/user.entity.js';

export interface AuthenticatedAdminRequest extends FastifyRequest {
  adminUser?: User;
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedAdminRequest>();

    const sessionCookie = request.cookies?.__session;
    const authHeader = request.headers.authorization;

    let idToken = '';
    if (authHeader?.startsWith('Bearer ')) {
      idToken = authHeader.substring(7);
    } else if (sessionCookie) {
      idToken = sessionCookie;
    }

    if (!idToken) {
      throw new UnauthorizedException('No authentication session found');
    }

    let uid: string;
    try {
      const decoded = await this.authService.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication session');
    }

    const user = await this.userRepository.findByUid(uid);
    if (!user) {
      throw new UnauthorizedException('Account not found');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Admin privileges required to access this resource');
    }

    if (user.status === 'disabled') {
      throw new ForbiddenException('Admin account is currently disabled');
    }

    request.adminUser = user;
    return true;
  }
}
