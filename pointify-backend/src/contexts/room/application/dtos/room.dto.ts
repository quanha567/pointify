import type { DeckType } from '../../domain/value-objects/deck.vo.js';
import type { CardValue } from '../../domain/value-objects/card.vo.js';
import type { RoomProjection } from '../../domain/room.aggregate.js';

export interface CreateRoomInputDto {
  name: string;
  deckType?: DeckType;
  customCards?: CardValue[];
  facilitator: {
    id?: string;
    displayName: string;
    photoURL?: string | null;
    isGuest?: boolean;
  };
}

export interface CreateRoomResultDto {
  room: RoomProjection;
  facilitatorKey: string;
}

export interface JoinRoomInputDto {
  roomId: string;
  participant: {
    id: string;
    displayName: string;
    photoURL?: string | null;
    isGuest?: boolean;
    isSpectator?: boolean;
  };
}

export interface SubmitEstimateInputDto {
  roomId: string;
  participantId: string;
  cardValue: CardValue;
}

export interface RevealCardsInputDto {
  roomId: string;
  facilitatorKey: string;
}

export interface NextRoundInputDto {
  roomId: string;
  facilitatorKey: string;
  nextTopic?: string;
}

export interface ResetRoundInputDto {
  roomId: string;
  facilitatorKey: string;
}

export interface ClaimFacilitatorInputDto {
  roomId: string;
  claimantId: string;
}

export interface UpdateRoomConfigInputDto {
  roomId: string;
  facilitatorKey: string;
  name?: string;
  deckType?: DeckType;
  customCards?: CardValue[];
}

export type TimerAction = 'start' | 'pause' | 'resume' | 'stop' | 'add_time';

export interface ManageTimerInputDto {
  roomId: string;
  facilitatorKey: string;
  action: TimerAction;
  durationSeconds?: number;
  additionalSeconds?: number;
}
