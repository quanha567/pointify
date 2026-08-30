import { Inject, Injectable, Logger } from '@nestjs/common';
import { type IUserRepository, USER_REPOSITORY } from '../../domain/user.repository.interface.js';
import { type IAuthService, AUTH_SERVICE } from '../services/auth-service.interface.js';
import { InvalidIdTokenError } from '../../domain/user.errors.js';
import { User } from '../../domain/user.entity.js';
import { UserMapper } from '../../infrastructure/mappers/user.mapper.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';
import type { SyncSessionInputDto, UserProfileDto } from '../dtos/user.dto.js';

@Injectable()
export class SyncSessionUserUseCase {
  private readonly logger = new Logger(SyncSessionUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  async execute(input: SyncSessionInputDto): Promise<Result<UserProfileDto, InvalidIdTokenError>> {
    if (!input.idToken) {
      return fail(new InvalidIdTokenError('Token is missing'));
    }

    try {
      this.logger.debug(`Verifying ID token...`);
      const decoded = await this.authService.verifyIdToken(input.idToken);
      this.logger.debug(`Decoded token UID: "${decoded.uid}", Email: "${decoded.email}"`);

      if (!decoded.uid) {
        throw new Error(`Decoded token has no UID: ${JSON.stringify(decoded)}`);
      }

      const existingUser = await this.userRepository.findByUid(decoded.uid);
      this.logger.debug(`Existing user found: ${existingUser ? existingUser.uid : 'null'}`);

      let user: User;
      if (!existingUser) {
        user = User.create(decoded.uid, {
          email: decoded.email,
          displayName: decoded.name || decoded.email?.split('@')[0] || 'User',
          photoURL: decoded.picture,
          providerId: decoded.providerId,
        });
      } else {
        user = existingUser;
        user.recordLogin();
        if (decoded.email && decoded.email !== user.email) {
          user.updateEmail(decoded.email);
        }
      }

      this.logger.debug(`About to save user with UID: "${user.uid}"`);
      await this.userRepository.save(user);
      this.logger.log(`Session synchronized & user upserted for UID: ${user.uid}`);
      return ok(UserMapper.toDto(user));
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(`Failed to verify ID token: ${err.message}`, err.stack);
        return fail(new InvalidIdTokenError(err.message));
      }
      this.logger.error(`Failed to verify ID token (unknown error): ${String(err)}`);
      return fail(new InvalidIdTokenError('Unknown error'));
    }
  }
}
