export interface AdminRoomListItemDto {
  id: string;
  name: string;
  facilitatorId: string;
  facilitatorName: string;
  deckType: string;
  participantCount: number;
  onlineCount: number;
  currentRoundNumber: number;
  currentRoundStatus: string;
  totalRounds: number;
  status: 'active' | 'closed';
  isStale: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AdminGetRoomsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'closed' | 'all';
  deckType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminGetRoomsResponseDto {
  items: AdminRoomListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminTakeoverResponseDto {
  roomId: string;
  facilitatorKey: string;
}

export interface AdminBulkRoomActionDto {
  roomIds: string[];
}

export interface AdminBulkRoomActionResultDto {
  success: boolean;
  count: number;
}
