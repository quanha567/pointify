import { z } from 'zod';
import type { UserAccountDto } from '@/features/admin/types/admin-users.types';

// ─── URL Search Params (Tầng 1: Route State) ────────────────────────────────

export const authSearchSchema = z.object({
  mode: z.enum(['login', 'register']).default('login'),
  redirect: z.string().optional(),
});

export type AuthSearchParams = z.infer<typeof authSearchSchema>;

export interface UserProfileResponse {
  success: boolean;
  user: UserAccountDto;
}

export interface SyncSessionRequest {
  idToken: string;
}
