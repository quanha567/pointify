import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Logger, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { JoinRoomUseCase } from '../../application/use-cases/join-room.use-case.js';
import { SubmitEstimateUseCase } from '../../application/use-cases/submit-estimate.use-case.js';
import { RevealCardsUseCase } from '../../application/use-cases/reveal-cards.use-case.js';
import { NextRoundUseCase } from '../../application/use-cases/next-round.use-case.js';
import { ClaimFacilitatorUseCase } from '../../application/use-cases/claim-facilitator.use-case.js';
import { SetParticipantOnlineUseCase } from '../../application/use-cases/set-participant-online.use-case.js';
import { SwitchRoleUseCase } from '../../application/use-cases/switch-role.use-case.js';
import { UpdateRoomConfigUseCase } from '../../application/use-cases/update-room-config.use-case.js';
import { ManageTimerUseCase } from '../../application/use-cases/manage-timer.use-case.js';
import type { CardValue } from '../../domain/value-objects/card.vo.js';
import type { DeckType } from '../../domain/value-objects/deck.vo.js';
import type { Room } from '../../domain/room.aggregate.js';

interface SocketSession {
  roomId: string;
  participantId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RoomGateway.name);
  private readonly socketSessions = new Map<string, SocketSession>();

  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly joinRoomUseCase: JoinRoomUseCase,
    private readonly submitEstimateUseCase: SubmitEstimateUseCase,
    private readonly revealCardsUseCase: RevealCardsUseCase,
    private readonly nextRoundUseCase: NextRoundUseCase,
    private readonly claimFacilitatorUseCase: ClaimFacilitatorUseCase,
    private readonly setParticipantOnlineUseCase: SetParticipantOnlineUseCase,
    private readonly switchRoleUseCase: SwitchRoleUseCase,
    private readonly updateRoomConfigUseCase: UpdateRoomConfigUseCase,
    private readonly manageTimerUseCase: ManageTimerUseCase,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    try {
      this.logger.log(`Client disconnected: ${client.id}`);
      const session = this.socketSessions.get(client.id);
      if (!session) return;

      this.socketSessions.delete(client.id);

      // Check if participant still has other active sockets in the same room
      const hasOtherSockets = Array.from(this.socketSessions.values()).some(
        (s) => s.roomId === session.roomId && s.participantId === session.participantId,
      );

      if (!hasOtherSockets) {
        await this.setParticipantOnlineUseCase.execute({
          roomId: session.roomId,
          participantId: session.participantId,
          isOnline: false,
        });

        await this.broadcastSanitizedRoomState(session.roomId);
      }
    } catch (err: unknown) {
      this.logger.error(`Error handling disconnect for client ${client.id}: ${(err as Error)?.message}`);
    }
  }

  @SubscribeMessage('room:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      participant: {
        id: string;
        displayName: string;
        photoURL?: string | null;
        isGuest?: boolean;
        isSpectator?: boolean;
      };
    },
  ) {
    try {
      const result = await this.joinRoomUseCase.execute({
        roomId: payload.roomId,
        participant: payload.participant,
      });

      if (result.isFail) {
        client.emit('room:error', { message: result.error.message });
        return;
      }

      await client.join(`room:${payload.roomId}`);
      this.socketSessions.set(client.id, {
        roomId: payload.roomId,
        participantId: payload.participant.id,
      });

      await this.broadcastSanitizedRoomState(payload.roomId);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to join room';
      this.logger.error(`Error joining room: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:estimate')
  async handleEstimate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      participantId: string;
      cardValue: CardValue | null;
    },
  ) {
    try {
      const room = await this.roomRepository.findById(payload.roomId);
      if (!room) {
        client.emit('room:error', { message: 'Room not found' });
        return;
      }

      if (payload.cardValue === null) {
        const clearRes = room.clearEstimate(payload.participantId);
        if (clearRes.isFail) {
          client.emit('room:error', { message: clearRes.error.message });
          return;
        }
        await this.roomRepository.save(room);
      } else {
        const result = await this.submitEstimateUseCase.execute({
          roomId: payload.roomId,
          participantId: payload.participantId,
          cardValue: payload.cardValue,
        });

        if (result.isFail) {
          client.emit('room:error', { message: result.error.message });
          return;
        }
      }

      await this.broadcastSanitizedRoomState(payload.roomId);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to submit estimate';
      this.logger.error(`Error submitting estimate: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:reveal')
  async handleReveal(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; facilitatorKey: string },
  ) {
    try {
      const result = await this.revealCardsUseCase.execute({
        roomId: payload.roomId,
        facilitatorKey: payload.facilitatorKey,
      });

      if (result.isFail) {
        client.emit('room:error', { message: result.error.message });
        return;
      }

      await this.broadcastSanitizedRoomState(payload.roomId);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to reveal cards';
      this.logger.error(`Error revealing cards: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:next-round')
  async handleNextRound(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId: string; facilitatorKey: string; nextTopic?: string },
  ) {
    try {
      const result = await this.nextRoundUseCase.execute({
        roomId: payload.roomId,
        facilitatorKey: payload.facilitatorKey,
        nextTopic: payload.nextTopic,
      });

      if (result.isFail) {
        client.emit('room:error', { message: result.error.message });
        return;
      }

      await this.broadcastSanitizedRoomState(payload.roomId);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to start next round';
      this.logger.error(`Error starting next round: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:claim-facilitator')
  async handleClaimFacilitator(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; claimantId: string },
  ) {
    try {
      const result = await this.claimFacilitatorUseCase.execute({
        roomId: payload.roomId,
        claimantId: payload.claimantId,
      });

      if (result.isFail) {
        client.emit('room:error', { message: result.error.message });
        return;
      }

      client.emit('room:claimed-facilitator', { facilitatorKey: result.value.newFacilitatorKey });
      await this.broadcastSanitizedRoomState(payload.roomId);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to claim facilitator';
      this.logger.error(`Error claiming facilitator: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:switch-role')
  async handleSwitchRole(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; participantId: string; isSpectator: boolean },
  ) {
    try {
      const result = await this.switchRoleUseCase.execute({
        roomId: payload.roomId,
        participantId: payload.participantId,
        isSpectator: payload.isSpectator,
      });

      if (result.isFail) {
        client.emit('room:error', { message: result.error.message });
        return;
      }

      await this.broadcastSanitizedRoomState(payload.roomId, result.value);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to switch role';
      this.logger.error(`Error switching role: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:update-config')
  async handleUpdateConfig(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      facilitatorKey: string;
      name?: string;
      deckType?: DeckType;
    },
  ) {
    try {
      const result = await this.updateRoomConfigUseCase.execute({
        roomId: payload.roomId,
        facilitatorKey: payload.facilitatorKey,
        name: payload.name,
        deckType: payload.deckType,
      });

      if (result.isFail) {
        client.emit('room:error', { message: result.error.message });
        return;
      }

      await this.broadcastSanitizedRoomState(payload.roomId, result.value.room);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to update room configuration';
      this.logger.error(`Error updating room configuration: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:manage-timer')
  async handleManageTimer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      facilitatorKey: string;
      action: 'start' | 'pause' | 'resume' | 'stop' | 'add_time';
      durationSeconds?: number;
      additionalSeconds?: number;
    },
  ) {
    try {
      const result = await this.manageTimerUseCase.execute({
        roomId: payload.roomId,
        facilitatorKey: payload.facilitatorKey,
        action: payload.action,
        durationSeconds: payload.durationSeconds,
        additionalSeconds: payload.additionalSeconds,
      });

      if (result.isFail) {
        client.emit('room:error', { message: result.error.message });
        return;
      }

      await this.broadcastSanitizedRoomState(payload.roomId, result.value);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to manage timer';
      this.logger.error(`Error managing timer: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:leave')
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; participantId: string },
  ) {
    try {
      await this.setParticipantOnlineUseCase.execute({
        roomId: payload.roomId,
        participantId: payload.participantId,
        isOnline: false,
      });

      await client.leave(`room:${payload.roomId}`);
      this.socketSessions.delete(client.id);

      await this.broadcastSanitizedRoomState(payload.roomId);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to leave room';
      this.logger.error(`Error leaving room: ${message}`);
    }
  }

  public async broadcastSanitizedRoomState(roomId: string, rawRoom?: Room) {
    const room = rawRoom || (await this.roomRepository.findById(roomId));
    if (!room) return;

    const roomChannel = `room:${roomId}`;
    const socketsInRoom = await this.server.in(roomChannel).fetchSockets();

    for (const socket of socketsInRoom) {
      const session = this.socketSessions.get(socket.id);
      const viewerId = session?.participantId;
      const sanitizedProjection = room.toProjection(viewerId);

      socket.emit('room:state', { room: sanitizedProjection });
    }
  }
}
