import { httpClient } from '@/lib/http-client';
import type {
  AdminRoomsSearchParams,
  AdminRoomListResponse,
  AdminRoomDetailDto,
} from '../types/admin-rooms.types';

export async function fetchAdminRoomsApi(
  params: AdminRoomsSearchParams = {},
): Promise<AdminRoomListResponse> {
  return httpClient.get<AdminRoomListResponse>('/api/admin/rooms', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search?.trim(),
      status: params.status && params.status !== 'all' ? params.status : undefined,
      deckType: params.deckType,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
  });
}

export async function fetchAdminRoomDetailApi(
  id: string,
): Promise<{ success: boolean; room: AdminRoomDetailDto }> {
  return httpClient.get<{ success: boolean; room: AdminRoomDetailDto }>(
    `/api/admin/rooms/${encodeURIComponent(id)}`,
  );
}

export async function closeAdminRoomApi(id: string): Promise<{ success: boolean }> {
  return httpClient.post<{ success: boolean }>(`/api/admin/rooms/${encodeURIComponent(id)}/close`);
}

export async function takeoverAdminRoomApi(
  id: string,
): Promise<{ success: boolean; data: { roomId: string; facilitatorKey: string } }> {
  return httpClient.post<{ success: boolean; data: { roomId: string; facilitatorKey: string } }>(
    `/api/admin/rooms/${encodeURIComponent(id)}/takeover`,
  );
}

export async function deleteAdminRoomApi(id: string): Promise<{ success: boolean; id: string }> {
  return httpClient.delete<{ success: boolean; id: string }>(
    `/api/admin/rooms/${encodeURIComponent(id)}`,
  );
}

export async function bulkCloseRoomsApi(
  roomIds: string[],
): Promise<{ success: boolean; count: number }> {
  return httpClient.post<{ success: boolean; count: number }>('/api/admin/rooms/bulk-close', {
    roomIds,
  });
}

export async function bulkDeleteRoomsApi(
  roomIds: string[],
): Promise<{ success: boolean; count: number }> {
  return httpClient.post<{ success: boolean; count: number }>('/api/admin/rooms/bulk-delete', {
    roomIds,
  });
}
