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
import { ResetRoundUseCase } from '../../application/use-cases/reset-round.use-case.js';
import { ClaimFacilitatorUseCase } from '../../application/use-cases/claim-facilitator.use-case.js';
import { SetParticipantOnlineUseCase } from '../../application/use-cases/set-participant-online.use-case.js';
import { SwitchRoleUseCase } from '../../application/use-cases/switch-role.use-case.js';
import { UpdateRoomConfigUseCase } from '../../application/use-cases/update-room-config.use-case.js';
import { ManageTimerUseCase } from '../../application/use-cases/manage-timer.use-case.js';
import type { CardValue } from '../../domain/value-objects/card.vo.js';
import type { DeckType } from '../../domain/value-objects/deck.vo.js';
import type { Room } from '../../domain/room.aggregate.js';
import {
  StickyNote,
  type StickyNoteColor,
  type StickyNotePosition,
} from '../../domain/entities/sticky-note.entity.js';

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
    private readonly resetRoundUseCase: ResetRoundUseCase,
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

      // Ensure socket session is mapped to participant for unmasking own estimate in broadcast
      if (!this.socketSessions.has(client.id) && payload.participantId) {
        this.socketSessions.set(client.id, {
          roomId: payload.roomId,
          participantId: payload.participantId,
        });
        await client.join(`room:${payload.roomId}`);
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
      const nextTopic = typeof payload.nextTopic === 'string' ? payload.nextTopic.trim() : undefined;
      const result = await this.nextRoundUseCase.execute({
        roomId: payload.roomId,
        facilitatorKey: payload.facilitatorKey,
        nextTopic,
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

  @SubscribeMessage('room:reset-round')
  async handleResetRound(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId: string; facilitatorKey: string },
  ) {
    try {
      const result = await this.resetRoundUseCase.execute({
        roomId: payload.roomId,
        facilitatorKey: payload.facilitatorKey,
      });

      if (result.isFail) {
        client.emit('room:error', { message: result.error.message });
        return;
      }

      await this.broadcastSanitizedRoomState(payload.roomId);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to reset round';
      this.logger.error(`Error resetting round: ${message}`);
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

  @SubscribeMessage('room:sticky-note-create')
  async handleStickyNoteCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      note: {
        id: string;
        text?: string;
        color?: StickyNoteColor;
        position: StickyNotePosition;
        authorId: string;
        authorName: string;
        isPinned?: boolean;
      };
    },
  ) {
    try {
      const room = await this.roomRepository.findById(payload.roomId);
      if (!room) return;

      const newNote = StickyNote.create(payload.note.id, {
        roomId: payload.roomId,
        text: payload.note.text ?? '',
        color: payload.note.color ?? 'yellow',
        position: payload.note.position,
        authorId: payload.note.authorId,
        authorName: payload.note.authorName,
        isPinned: payload.note.isPinned ?? false,
      });

      room.addStickyNote(newNote);
      await this.roomRepository.save(room);

      const roomChannel = `room:${payload.roomId}`;
      this.server.in(roomChannel).emit('room:sticky-note-created', {
        note: newNote.toProjection(),
      });
      await this.broadcastSanitizedRoomState(payload.roomId, room);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to create sticky note';
      this.logger.error(`Error creating sticky note: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:sticky-note-move')
  async handleStickyNoteMove(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      noteId: string;
      position: StickyNotePosition;
      isFinal?: boolean;
    },
  ) {
    try {
      const roomChannel = `room:${payload.roomId}`;
      // Broadcast live movement immediately to all other participants in the room
      client.to(roomChannel).emit('room:sticky-note-moved', {
        noteId: payload.noteId,
        position: payload.position,
      });

      // If final position after drag end, persist to repository
      if (payload.isFinal) {
        const room = await this.roomRepository.findById(payload.roomId);
        if (room) {
          room.moveStickyNote(payload.noteId, payload.position);
          await this.roomRepository.save(room);
        }
      }
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to move sticky note';
      this.logger.error(`Error moving sticky note: ${message}`);
    }
  }

  @SubscribeMessage('room:sticky-note-edit')
  async handleStickyNoteEdit(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      noteId: string;
      text: string;
      color?: StickyNoteColor;
    },
  ) {
    try {
      const room = await this.roomRepository.findById(payload.roomId);
      if (!room) return;

      const edited = room.editStickyNote(payload.noteId, payload.text, payload.color);
      if (!edited) return;

      await this.roomRepository.save(room);

      const roomChannel = `room:${payload.roomId}`;
      this.server.in(roomChannel).emit('room:sticky-note-edited', {
        noteId: payload.noteId,
        text: payload.text,
        color: payload.color,
      });
      await this.broadcastSanitizedRoomState(payload.roomId, room);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to edit sticky note';
      this.logger.error(`Error editing sticky note: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:sticky-note-pin')
  async handleStickyNotePin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      noteId: string;
    },
  ) {
    try {
      const room = await this.roomRepository.findById(payload.roomId);
      if (!room) return;

      const isPinned = room.togglePinStickyNote(payload.noteId);
      if (isPinned === null) return;

      await this.roomRepository.save(room);

      const roomChannel = `room:${payload.roomId}`;
      this.server.in(roomChannel).emit('room:sticky-note-pinned', {
        noteId: payload.noteId,
        isPinned,
      });
      await this.broadcastSanitizedRoomState(payload.roomId, room);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to pin sticky note';
      this.logger.error(`Error pinning sticky note: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:sticky-note-delete')
  async handleStickyNoteDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      noteId: string;
    },
  ) {
    try {
      const room = await this.roomRepository.findById(payload.roomId);
      if (!room) return;

      const deleted = room.deleteStickyNote(payload.noteId);
      if (!deleted) return;

      await this.roomRepository.save(room);

      const roomChannel = `room:${payload.roomId}`;
      this.server.in(roomChannel).emit('room:sticky-note-deleted', {
        noteId: payload.noteId,
      });
      await this.broadcastSanitizedRoomState(payload.roomId, room);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to delete sticky note';
      this.logger.error(`Error deleting sticky note: ${message}`);
      client.emit('room:error', { message });
    }
  }

  @SubscribeMessage('room:sticky-note-editing-start')
  async handleStickyNoteEditingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      noteId: string;
      user: { userId: string; userName: string };
    },
  ) {
    const roomChannel = `room:${payload.roomId}`;
    client.to(roomChannel).emit('room:sticky-note-editing-changed', {
      noteId: payload.noteId,
      editingBy: payload.user,
    });
  }

  @SubscribeMessage('room:sticky-note-editing-end')
  async handleStickyNoteEditingEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      noteId: string;
    },
  ) {
    const roomChannel = `room:${payload.roomId}`;
    client.to(roomChannel).emit('room:sticky-note-editing-changed', {
      noteId: payload.noteId,
      editingBy: null,
    });
  }


  @SubscribeMessage('room:jira-sync-points')
  async handleJiraSyncPoints(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      facilitatorKey: string;
      storyKey: string;
      points: number | string;
    },
  ) {
    try {
      const room = await this.roomRepository.findById(payload.roomId);
      if (!room) {
        client.emit('room:error', { message: 'Phòng không tồn tại' });
        return;
      }

      if (!room.facilitatorKey.matches(payload.facilitatorKey)) {
        client.emit('room:error', { message: 'Bạn không có quyền điều phối phòng' });
        return;
      }

      room.updateStoryEstimate(payload.storyKey, payload.points);
      await this.roomRepository.save(room);
      await this.broadcastSanitizedRoomState(payload.roomId, room);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Lỗi khi cập nhật điểm Story trong phòng';
      this.logger.error(`Error updating story points in room: ${message}`);
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
