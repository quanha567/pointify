export interface UserProfileDto {
  uid: string;
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

export interface SyncSessionInputDto {
  idToken: string;
}

export interface UpdateProfileInputDto {
  uid: string;
  displayName?: string;
  photoURL?: string | null;
}

export interface AdminUpdateUserInputDto {
  uid: string;
  displayName?: string;
  photoURL?: string | null;
  role?: 'admin' | 'member';
  status?: 'active' | 'disabled';
}

export interface ListUsersInputDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'member';
  status?: 'active' | 'disabled';
  providerId?: string;
  sortBy?: 'createdAt' | 'displayName' | 'lastLoginAt' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface ListUsersResultDto {
  users: UserProfileDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

