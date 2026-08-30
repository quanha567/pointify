import { DomainError } from '../../../shared/domain/domain-error.base.js';

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';

  constructor(uid: string) {
    super(`User with UID '${uid}' not found`);
  }
}

export class InvalidIdTokenError extends DomainError {
  readonly code = 'INVALID_ID_TOKEN';

  constructor(reason?: string) {
    super(`Invalid or expired Firebase ID token${reason ? `: ${reason}` : ''}`);
  }
}
