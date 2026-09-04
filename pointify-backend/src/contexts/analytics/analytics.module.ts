import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../firebase/firebase.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { RoomModule } from '../room/room.module.js';
import { GetAdminOverviewUseCase } from './application/use-cases/get-admin-overview.use-case.js';
import { AdminOverviewController } from './presentation/controllers/admin-overview.controller.js';

@Module({
  imports: [FirebaseModule, IdentityModule, RoomModule],
  controllers: [AdminOverviewController],
  providers: [GetAdminOverviewUseCase],
  exports: [GetAdminOverviewUseCase],
})
export class AnalyticsModule {}
