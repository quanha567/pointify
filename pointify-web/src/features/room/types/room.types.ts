export type DeckType = 'fibonacci' | 'modified-fibonacci' | 't-shirt' | 'powers-of-2';
export type ParticipantRole = 'estimator' | 'spectator';
export type CardValue = string | number;

export interface RecentRoom {
  code: string;
  name: string;
  deckType: DeckType;
  lastVisited: string;
  role: ParticipantRole;
  timestamp: number;
}

export interface ParticipantProjection {
  id: string;
  displayName: string;
  photoURL: string | null;
  isGuest: boolean;
  isSpectator: boolean;
  isOnline: boolean;
  isFacilitator: boolean;
  hasEstimated: boolean;
  estimatedValue: CardValue | null;
}

export interface RoundStatistics {
  average: number | null;
  agreementScore: number | null;
  consensus: boolean;
  distribution: Record<string, number>;
}

export interface RoundTimerProjection {
  durationSeconds: number;
  endsAt: number;
  status: 'running' | 'paused';
  remainingSecondsOnPause?: number;
}

export type StickyNoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange';

export interface StickyNotePosition {
  x: number;
  y: number;
}

export interface StickyNoteEditingUser {
  userId: string;
  userName: string;
}

export interface StickyNoteProjection {
  id: string;
  roomId: string;
  text: string;
  color: StickyNoteColor;
  position: StickyNotePosition;
  authorId: string;
  authorName: string;
  isPinned: boolean;
  editingBy?: StickyNoteEditingUser | null;
  createdAt: number;
  updatedAt: number;
}

export interface CurrentRoundProjection {
  roundNumber: number;
  status: 'voting' | 'revealed' | 'completed';
  topic: string;
  startedAt: number;
  revealedAt: number | null;
  statistics: RoundStatistics | null;
  timer: RoundTimerProjection | null;
  archivedStickyNotes?: StickyNoteProjection[];
}

export interface RoomProjection {
  id: string;
  name: string;
  deckType: DeckType;
  deckCards: CardValue[];
  facilitatorId: string;
  version: number;
  participants: ParticipantProjection[];
  stickyNotes?: StickyNoteProjection[];
  currentRound: CurrentRoundProjection;
  roundsHistoryCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateRoomDto {
  name: string;
  deckType?: DeckType;
  customCards?: CardValue[];
  facilitator: {
    id?: string;
    displayName: string;
    photoURL?: string | null;
    isGuest?: boolean;
  };
}

export interface CreateRoomResponse {
  room: RoomProjection;
  facilitatorKey: string;
}
