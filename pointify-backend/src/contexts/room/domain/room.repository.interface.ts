import type { Room } from './room.aggregate.js';

export interface IRoomRepository {
  findById(id: string): Promise<Room | null>;
  save(room: Room): Promise<void>;
  delete(id: string): Promise<void>;
}

export const ROOM_REPOSITORY = Symbol('IRoomRepository');
