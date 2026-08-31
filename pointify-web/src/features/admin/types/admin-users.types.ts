import { z } from 'zod';

// Search Params Schema for TanStack Router URL synchronization
export const adminUsersSearchSchema = z.object({
  page: z.number().catch(1).optional(),
  limit: z.number().catch(20).optional(),
  search: z.string().optional(),
  role: z.enum(['admin', 'member']).optional(),
  status: z.enum(['active', 'disabled']).optional(),
  sortBy: z.enum(['createdAt', 'displayName', 'lastLoginAt', 'email']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type AdminUsersSearchParams = z.infer<typeof adminUsersSearchSchema>;

// User Account DTO Schema
export const userAccountSchema = z.object({
  uid: z.string(),
  email: z.string().nullable(),
  displayName: z.string(),
  photoURL: z.string().nullable(),
  providerId: z.string(),
  role: z.enum(['admin', 'member']),
  status: z.enum(['active', 'disabled']),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastLoginAt: z.number(),
});

export type UserAccountDto = z.infer<typeof userAccountSchema>;

// User Form Schema for creating and editing accounts
export const userFormSchema = z.object({
  email: z.string().email('Địa chỉ email không hợp lệ').min(5, 'Email không được để trống'),
  displayName: z
    .string()
    .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
    .max(50, 'Tên hiển thị không được vượt quá 50 ký tự'),
  photoURL: z.string().url('Đường dẫn ảnh đại diện không hợp lệ').or(z.literal('')).optional(),
  role: z.enum(['admin', 'member']),
  status: z.enum(['active', 'disabled']),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

// React 19 Ref-as-a-prop handle for UserFormSheet
export interface UserFormSheetHandle {
  open: (user?: UserAccountDto | null) => void;
  close: () => void;
}

export interface AdminUserListResponse {
  success: boolean;
  users: UserAccountDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminCreateUserData {
  email: string;
  displayName: string;
  photoURL?: string | null;
  role?: 'admin' | 'member';
  status?: 'active' | 'disabled';
}

export interface AdminUpdateUserData {
  displayName?: string;
  photoURL?: string | null;
  role?: 'admin' | 'member';
  status?: 'active' | 'disabled';
}

export interface AdminBulkUpdateResponse {
  success: boolean;
  updatedCount: number;
}
