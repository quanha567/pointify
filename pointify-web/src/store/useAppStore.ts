import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import i18n from '@/i18n';

export type SupportedLanguage = 'vi' | 'en';
export type DeckType = 'fibonacci' | 'modified-fibonacci' | 't-shirt' | 'powers-of-2';
export type ParticipantRole = 'estimator' | 'spectator';

export interface RecentRoom {
  code: string;
  name: string;
  deckType: DeckType;
  lastVisited: string;
  role: ParticipantRole;
  timestamp: number;
}

interface AppState {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  recentRooms: RecentRoom[];
  addRecentRoom: (room: Omit<RecentRoom, 'timestamp'>) => void;
  clearRecentRooms: () => void;
}

const DEFAULT_RECENT_ROOMS: RecentRoom[] = [
  {
    code: 'SPRINT-42',
    name: 'Sprint 42 Refinement',
    deckType: 'fibonacci',
    lastVisited: '2h ago',
    role: 'estimator',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'vi',
      setLanguage: (lang: SupportedLanguage) => {
        set({ language: lang });
        void i18n.changeLanguage(lang);
      },
      recentRooms: DEFAULT_RECENT_ROOMS,
      addRecentRoom: (room) => {
        const current = get().recentRooms;
        const newRoom: RecentRoom = {
          ...room,
          timestamp: Date.now(),
        };
        const filtered = current.filter((r) => r.code !== room.code);
        set({ recentRooms: [newRoom, ...filtered].slice(0, 6) });
      },
      clearRecentRooms: () => {
        set({ recentRooms: [] });
      },
    }),
    {
      name: 'pointify_app_store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          void i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
