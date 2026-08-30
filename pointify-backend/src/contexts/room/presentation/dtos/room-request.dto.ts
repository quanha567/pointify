import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DeckType } from '../../domain/value-objects/deck.vo.js';
import type { CardValue } from '../../domain/value-objects/card.vo.js';

export class FacilitatorInputDto {
  @ApiPropertyOptional({
    description: 'Unique user identifier (UID) if authenticated',
    example: 'usr_123456',
  })
  id?: string;

  @ApiProperty({
    description: 'Display name of the facilitator',
    example: 'Alice (Scrum Master)',
  })
  displayName!: string;

  @ApiPropertyOptional({
    description: 'Avatar image URL',
    example: 'https://pointify.app/avatar.png',
    nullable: true,
  })
  photoURL?: string | null;

  @ApiPropertyOptional({
    description: 'Whether facilitator is a temporary guest user',
    example: false,
    default: true,
  })
  isGuest?: boolean;
}

export class CreateRoomRequestDto {
  @ApiProperty({
    description: 'Name/Topic of the estimation session',
    example: 'Sprint 42 - User Stories Sizing',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Estimation deck system',
    enum: ['fibonacci', 'modified-fibonacci', 't-shirt', 'custom'],
    default: 'fibonacci',
    example: 'fibonacci',
  })
  deckType?: DeckType;

  @ApiPropertyOptional({
    description: 'Custom card values if deckType is custom',
    example: [1, 2, 3, 5, 8, 13],
  })
  customCards?: CardValue[];

  @ApiProperty({
    type: FacilitatorInputDto,
    description: 'Facilitator information',
  })
  facilitator!: FacilitatorInputDto;
}

export class ParticipantInputDto {
  @ApiProperty({
    description: 'Participant unique ID',
    example: 'usr_789012',
  })
  id!: string;

  @ApiProperty({
    description: 'Display name of the participant',
    example: 'Bob (Frontend Dev)',
  })
  displayName!: string;

  @ApiPropertyOptional({
    description: 'Avatar image URL',
    example: 'https://pointify.app/avatar-bob.png',
    nullable: true,
  })
  photoURL?: string | null;

  @ApiPropertyOptional({
    description: 'Whether participant is a guest',
    example: true,
    default: true,
  })
  isGuest?: boolean;

  @ApiPropertyOptional({
    description: 'Whether participant is a spectator/observer (cannot vote)',
    example: false,
    default: false,
  })
  isSpectator?: boolean;
}

export class JoinRoomRequestDto {
  @ApiProperty({
    type: ParticipantInputDto,
    description: 'Joining participant information',
  })
  participant!: ParticipantInputDto;
}

export class SubmitEstimateRequestDto {
  @ApiProperty({
    description: 'ID of the participant submitting estimate',
    example: 'usr_789012',
  })
  participantId!: string;

  @ApiProperty({
    description: 'Chosen card value from the room deck',
    example: 5,
  })
  cardValue!: CardValue;
}

export class RevealCardsRequestDto {
  @ApiProperty({
    description: 'Secret facilitator key issued when room was created',
    example: 'fkey_abc123xyz',
  })
  facilitatorKey!: string;
}

export class NextRoundRequestDto {
  @ApiProperty({
    description: 'Secret facilitator key',
    example: 'fkey_abc123xyz',
  })
  facilitatorKey!: string;

  @ApiPropertyOptional({
    description: 'Optional topic/ticket summary for the next round',
    example: 'Story #103 - Checkout Flow Improvements',
  })
  nextTopic?: string;
}

export class ClaimFacilitatorRequestDto {
  @ApiProperty({
    description: 'Participant ID who is claiming host/facilitator role',
    example: 'usr_789012',
  })
  claimantId!: string;
}
