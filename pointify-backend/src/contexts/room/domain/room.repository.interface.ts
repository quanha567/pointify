import type { Room, RoomStatus } from './room.aggregate.js';

export interface FindRoomsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'closed' | 'all';
  deckType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FindRoomsResult {
  rooms: Room[];
  total: number;
}

export interface IRoomRepository {
  findById(id: string): Promise<Room | null>;
  save(room: Room): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(options?: FindRoomsOptions): Promise<FindRoomsResult>;
  bulkClose(ids: string[]): Promise<number>;
  bulkDelete(ids: string[]): Promise<number>;
}

export const ROOM_REPOSITORY = Symbol('IRoomRepository');
