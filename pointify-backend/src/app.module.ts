import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { FirebaseModule } from './firebase/firebase.module.js';
import { IdentityModule } from './contexts/identity/identity.module.js';
import { RoomModule } from './contexts/room/room.module.js';

@Module({
  imports: [FirebaseModule, IdentityModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
