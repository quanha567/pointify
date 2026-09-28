import { z } from 'zod';

// Search Params Schema for TanStack Router URL synchronization
export const adminRoomsSearchSchema = z.object({
  page: z.number().catch(1).optional(),
  limit: z.number().catch(20).optional(),
  search: z.string().optional(),
  status: z.enum(['active', 'closed', 'all']).catch('all').optional(),
  deckType: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'participants', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type AdminRoomsSearchParams = z.infer<typeof adminRoomsSearchSchema>;

// Room List Item DTO Schema
export const adminRoomItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  facilitatorId: z.string(),
  facilitatorName: z.string(),
  deckType: z.string(),
  participantCount: z.number(),
  onlineCount: z.number(),
  currentRoundNumber: z.number(),
  currentRoundStatus: z.string(),
  totalRounds: z.number(),
  status: z.enum(['active', 'closed']),
  isStale: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type AdminRoomItemDto = z.infer<typeof adminRoomItemSchema>;

export interface AdminRoomListResponse {
  items: AdminRoomItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminRoomParticipantDetail {
  id: string;
  displayName: string;
  photoURL: string | null;
  isGuest: boolean;
  isSpectator: boolean;
  isOnline: boolean;
  isFacilitator: boolean;
  hasEstimated: boolean;
  estimatedValue?: string | number | null;
}

export interface AdminRoomDetailRound {
  roundNumber: number;
  status: 'voting' | 'revealed' | 'completed';
  topic: string;
  startedAt: number;
  revealedAt: number | null;
  statistics?: {
    average: number | null;
    median: number | null;
    mode: string | number | null;
    consensus: boolean;
    highestEstimate: { value: string | number; count: number } | null;
    lowestEstimate: { value: string | number; count: number } | null;
    agreementPercentage: number;
  } | null;
  linkedJiraIssue?: {
    id: string;
    key: string;
    summary: string;
    url: string;
    status: string;
    currentStoryPoints?: number | string | null;
    issueType: string;
  } | null;
}

export interface AdminRoomDetailDto {
  id: string;
  name: string;
  deckType: string;
  deckCards: (string | number)[];
  facilitatorId: string;
  version: number;
  status: 'active' | 'closed';
  participants: AdminRoomParticipantDetail[];
  currentRound: AdminRoomDetailRound;
  roundsHistoryCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface RoomDetailDialogHandle {
  open: (roomId: string) => void;
  close: () => void;
}
