import { AggregateRoot } from '../../../shared/domain/aggregate-root.base.js';

export interface UserProps {
  email: string | null;
  displayName: string;
  photoURL: string | null;
  providerId: string;
  role: 'admin' | 'member';
  status: 'active' | 'disabled';
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
}

export class User extends AggregateRoot<UserProps, string> {
  private constructor(uid: string, props: UserProps) {
    super(uid, props);
  }

  public static create(
    uid: string,
    props: {
      email: string | null;
      displayName: string;
      photoURL?: string | null;
      providerId?: string;
      role?: 'admin' | 'member';
      status?: 'active' | 'disabled';
      createdAt?: number;
      updatedAt?: number;
      lastLoginAt?: number;
    },
  ): User {
    const now = Date.now();
    return new User(uid, {
      email: props.email,
      displayName: props.displayName || props.email?.split('@')[0] || 'User',
      photoURL: props.photoURL ?? null,
      providerId: props.providerId || 'password',
      role: props.role || 'member',
      status: props.status || 'active',
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      lastLoginAt: props.lastLoginAt ?? now,
    });
  }

  get uid(): string {
    return this._id;
  }

  get email(): string | null {
    return this.props.email;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get photoURL(): string | null {
    return this.props.photoURL;
  }

  get providerId(): string {
    return this.props.providerId;
  }

  get role(): 'admin' | 'member' {
    return this.props.role;
  }

  get status(): 'active' | 'disabled' {
    return this.props.status;
  }

  get createdAt(): number {
    return this.props.createdAt;
  }

  get updatedAt(): number {
    return this.props.updatedAt;
  }

  get lastLoginAt(): number {
    return this.props.lastLoginAt;
  }

  public recordLogin(now = Date.now()): void {
    this.props.lastLoginAt = now;
    this.props.updatedAt = now;
  }

  public updateProfile(params: {
    displayName?: string;
    photoURL?: string | null;
    role?: 'admin' | 'member';
    status?: 'active' | 'disabled';
  }): void {
    if (params.displayName !== undefined && params.displayName.trim().length > 0) {
      this.props.displayName = params.displayName.trim();
    }
    if (params.photoURL !== undefined) {
      this.props.photoURL = params.photoURL;
    }
    if (params.role !== undefined) {
      this.props.role = params.role;
    }
    if (params.status !== undefined) {
      this.props.status = params.status;
    }
    this.props.updatedAt = Date.now();
  }

  public updateEmail(email: string | null): void {
    this.props.email = email;
    this.props.updatedAt = Date.now();
  }
}
