import type { User } from './user.entity.js';

export interface FindUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'member';
  status?: 'active' | 'disabled';
  providerId?: string;
  sortBy?: 'createdAt' | 'displayName' | 'lastLoginAt' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface FindUsersResult {
  users: User[];
  total: number;
}

export interface IUserRepository {
  findByUid(uid: string): Promise<User | null>;
  save(user: User): Promise<void>;
  findAll(options?: FindUsersOptions): Promise<FindUsersResult>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');

