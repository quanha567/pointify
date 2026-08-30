import { DomainError } from '../../../shared/domain/domain-error.base.js';

export class RoomNotFoundError extends DomainError {
  readonly code = 'ROOM_NOT_FOUND';
  constructor(roomId: string) {
    super(`Room '${roomId}' not found`);
  }
}

export class UnauthorizedFacilitatorError extends DomainError {
  readonly code = 'UNAUTHORIZED_FACILITATOR';
  constructor(message = 'Invalid facilitator credentials or unauthorized action') {
    super(message);
  }
}

export class ParticipantNotFoundError extends DomainError {
  readonly code = 'PARTICIPANT_NOT_FOUND';
  constructor(participantId: string) {
    super(`Participant '${participantId}' is not in this room`);
  }
}

export class InvalidCardValueError extends DomainError {
  readonly code = 'INVALID_CARD_VALUE';
  constructor(value: string | number) {
    super(`Card value '${value}' is not valid for the active room deck`);
  }
}

export class RoundAlreadyRevealedError extends DomainError {
  readonly code = 'ROUND_ALREADY_REVEALED';
  constructor() {
    super('The current round is already revealed. Start a new round to estimate.');
  }
}

export class CannotClaimFacilitatorError extends DomainError {
  readonly code = 'CANNOT_CLAIM_FACILITATOR';
  constructor(reason: string) {
    super(`Cannot claim facilitator: ${reason}`);
  }
}

export class ConcurrencyConflictError extends DomainError {
  readonly code = 'CONCURRENCY_CONFLICT';
  constructor() {
    super('Room state was modified by another concurrent operation. Please retry.');
  }
}
