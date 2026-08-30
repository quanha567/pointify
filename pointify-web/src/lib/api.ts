const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface UserProfileResponse {
  success: boolean;
  user: {
    uid: string;
    email: string | null;
    displayName: string;
    photoURL: string | null;
    providerId: string;
    createdAt: number;
    updatedAt: number;
    lastLoginAt: number;
  };
}

export async function syncSessionWithBackend(idToken: string): Promise<UserProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Session synchronization failed (${response.status})`);
  }

  return response.json();
}

export async function logoutBackendSession(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
    console.warn('Backend logout request failed (non-blocking):', err);
  }
}

export async function fetchCurrentProfile(): Promise<UserProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch current user (${response.status})`);
  }

  return response.json();
}
