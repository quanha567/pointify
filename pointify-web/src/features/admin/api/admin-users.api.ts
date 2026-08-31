import { httpClient } from '@/lib/http-client';
import type {
  AdminUsersSearchParams,
  AdminUserListResponse,
  AdminCreateUserData,
  AdminUpdateUserData,
  AdminBulkUpdateResponse,
  UserAccountDto,
} from '../types/admin-users.types';

export interface UserProfileResponse {
  success: boolean;
  user: UserAccountDto;
}

export async function fetchAdminUsersApi(
  params: AdminUsersSearchParams = {},
): Promise<AdminUserListResponse> {
  return httpClient.get<AdminUserListResponse>('/api/admin/users', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search?.trim(),
      role: params.role,
      status: params.status,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
  });
}

export async function createAdminUserApi(data: AdminCreateUserData): Promise<UserProfileResponse> {
  return httpClient.post<UserProfileResponse>('/api/admin/users', data);
}

export async function updateAdminUserApi(
  uid: string,
  data: AdminUpdateUserData,
): Promise<UserProfileResponse> {
  return httpClient.patch<UserProfileResponse>(`/api/admin/users/${encodeURIComponent(uid)}`, data);
}

export async function bulkUpdateUserStatusApi(
  uids: string[],
  status: 'active' | 'disabled',
): Promise<AdminBulkUpdateResponse> {
  return httpClient.patch<AdminBulkUpdateResponse>('/api/admin/users/bulk-status', {
    uids,
    status,
  });
}
