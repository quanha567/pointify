import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../firebase/firebase.module.js';
import { USER_REPOSITORY } from './domain/user.repository.interface.js';
import { AUTH_SERVICE } from './application/services/auth-service.interface.js';
import { FirestoreUserRepository } from './infrastructure/repositories/firestore-user.repository.js';
import { FirebaseAuthService } from './infrastructure/services/firebase-auth.service.js';
import { SyncSessionUserUseCase } from './application/use-cases/sync-session-user.use-case.js';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case.js';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case.js';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case.js';
import { AdminUpdateUserUseCase } from './application/use-cases/admin-update-user.use-case.js';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { UsersController } from './presentation/controllers/users.controller.js';
import { AdminUsersController } from './presentation/controllers/admin-users.controller.js';

@Module({
  imports: [FirebaseModule],
  controllers: [AuthController, UsersController, AdminUsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: FirestoreUserRepository,
    },
    {
      provide: AUTH_SERVICE,
      useClass: FirebaseAuthService,
    },
    SyncSessionUserUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    ListUsersUseCase,
    AdminUpdateUserUseCase,
  ],
  exports: [USER_REPOSITORY, AUTH_SERVICE, GetUserProfileUseCase, ListUsersUseCase],
})
export class IdentityModule {}

