import { httpClient } from '@/lib/http-client';
import type { CreateRoomDto, CreateRoomResponse, RoomProjection } from '../types/room.types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function createRoomApi(payload: CreateRoomDto): Promise<CreateRoomResponse> {
  const response = await httpClient.post<ApiResponse<CreateRoomResponse>>('/api/rooms', payload);
  return response.data;
}

export async function getRoomApi(roomId: string, viewerId?: string): Promise<RoomProjection> {
  const response = await httpClient.get<{
    success: boolean;
    data?: RoomProjection;
    room?: RoomProjection;
  }>(`/api/rooms/${encodeURIComponent(roomId)}`, {
    params: viewerId ? { viewerId } : undefined,
  });
  const room = response.data || response.room;
  if (!room) {
    throw new Error('Room data not found in response');
  }
  return room;
}
