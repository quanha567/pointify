import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../firebase/firebase.module.js';
import { ROOM_REPOSITORY } from './domain/room.repository.interface.js';
import { FirestoreRoomRepository } from './infrastructure/repositories/firestore-room.repository.js';
import { CreateRoomUseCase } from './application/use-cases/create-room.use-case.js';
import { GetRoomUseCase } from './application/use-cases/get-room.use-case.js';
import { JoinRoomUseCase } from './application/use-cases/join-room.use-case.js';
import { SubmitEstimateUseCase } from './application/use-cases/submit-estimate.use-case.js';
import { RevealCardsUseCase } from './application/use-cases/reveal-cards.use-case.js';
import { NextRoundUseCase } from './application/use-cases/next-round.use-case.js';
import { ClaimFacilitatorUseCase } from './application/use-cases/claim-facilitator.use-case.js';
import { RoomController } from './presentation/controllers/room.controller.js';

@Module({
  imports: [FirebaseModule],
  controllers: [RoomController],
  providers: [
    {
      provide: ROOM_REPOSITORY,
      useClass: FirestoreRoomRepository,
    },
    CreateRoomUseCase,
    GetRoomUseCase,
    JoinRoomUseCase,
    SubmitEstimateUseCase,
    RevealCardsUseCase,
    NextRoundUseCase,
    ClaimFacilitatorUseCase,
  ],
  exports: [
    ROOM_REPOSITORY,
    CreateRoomUseCase,
    GetRoomUseCase,
    JoinRoomUseCase,
    SubmitEstimateUseCase,
    RevealCardsUseCase,
    NextRoundUseCase,
    ClaimFacilitatorUseCase,
  ],
})
export class RoomModule {}
