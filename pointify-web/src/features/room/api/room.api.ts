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
  const response = await httpClient.get<ApiResponse<RoomProjection>>(
    `/api/rooms/${encodeURIComponent(roomId)}`,
    {
      params: viewerId ? { viewerId } : undefined,
    },
  );
  return response.data;
}
