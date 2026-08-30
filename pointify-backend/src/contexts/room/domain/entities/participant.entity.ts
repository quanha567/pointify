import { Entity } from '../../../../shared/domain/entity.base.js';

export interface ParticipantProps {
  displayName: string;
  photoURL: string | null;
  isGuest: boolean;
  isSpectator: boolean;
  isOnline: boolean;
  joinedAt: number;
  lastActiveAt: number;
}

export class Participant extends Entity<ParticipantProps, string> {
  private constructor(id: string, props: ParticipantProps) {
    super(id, props);
  }

  public static create(
    id: string,
    props: {
      displayName: string;
      photoURL?: string | null;
      isGuest?: boolean;
      isSpectator?: boolean;
      isOnline?: boolean;
      joinedAt?: number;
      lastActiveAt?: number;
    },
  ): Participant {
    const now = Date.now();
    return new Participant(id, {
      displayName: props.displayName.trim() || 'Anonymous',
      photoURL: props.photoURL ?? null,
      isGuest: props.isGuest ?? true,
      isSpectator: props.isSpectator ?? false,
      isOnline: props.isOnline ?? true,
      joinedAt: props.joinedAt ?? now,
      lastActiveAt: props.lastActiveAt ?? now,
    });
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get photoURL(): string | null {
    return this.props.photoURL;
  }

  get isGuest(): boolean {
    return this.props.isGuest;
  }

  get isSpectator(): boolean {
    return this.props.isSpectator;
  }

  get isOnline(): boolean {
    return this.props.isOnline;
  }

  get joinedAt(): number {
    return this.props.joinedAt;
  }

  get lastActiveAt(): number {
    return this.props.lastActiveAt;
  }

  public setOnline(isOnline: boolean): void {
    this.props.isOnline = isOnline;
    this.props.lastActiveAt = Date.now();
  }

  public setSpectator(isSpectator: boolean): void {
    this.props.isSpectator = isSpectator;
    this.props.lastActiveAt = Date.now();
  }

  public touch(): void {
    this.props.lastActiveAt = Date.now();
  }
}
