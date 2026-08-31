import { httpClient } from '@/lib/http-client';
import type { UserProfileResponse, SyncSessionRequest } from '../types/auth.types';

export async function syncSessionWithBackend(idToken: string): Promise<UserProfileResponse> {
  return httpClient.post<UserProfileResponse>('/api/auth/session', {
    idToken,
  } satisfies SyncSessionRequest);
}

export async function logoutBackendSession(): Promise<void> {
  try {
    await httpClient.post<void>('/api/auth/logout');
  } catch (err) {
    console.warn('Backend logout request failed (non-blocking):', err);
  }
}

export async function fetchCurrentProfile(): Promise<UserProfileResponse> {
  return httpClient.get<UserProfileResponse>('/api/users/me');
}
