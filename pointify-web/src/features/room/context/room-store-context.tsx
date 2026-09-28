import { createContext, useContext, useRef, useEffect, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import type { SocketConnectionStatus } from '../api/use-socket-instance';
import type { CardValue, DeckType, StickyNoteColor } from '../types/room.types';
import type { StoredParticipant } from '../utils/participant-session';

export interface RoomSocketActions {
  joinRoom: (newParticipant: StoredParticipant) => void;
  submitEstimate: (card: CardValue | null) => void;
  revealCards: () => void;
  nextRound: (topic?: string) => void;
  resetRound: () => void;
  claimFacilitator: (passcode?: string) => void;
  switchRole: (isSpectator: boolean) => void;
  updateRoomConfig: (config: { name?: string; deckType?: DeckType }) => void;
  startTimer: (durationSeconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  addTimerSeconds: (seconds: number) => void;
  createStickyNote: (noteData: {
    id?: string;
    text?: string;
    color?: StickyNoteColor;
    position: { x: number; y: number };
    isPinned?: boolean;
  }) => string;
  moveStickyNote: (noteId: string, position: { x: number; y: number }, isFinal?: boolean) => void;
  editStickyNote: (noteId: string, content: string, color?: StickyNoteColor) => void;
  togglePinStickyNote: (noteId: string) => void;
  deleteStickyNote: (noteId: string) => void;
  startEditingStickyNote: (noteId: string) => void;
  stopEditingStickyNote: (noteId: string) => void;
  syncJiraPoints: (issueKey: string, points: number) => void;
  leaveRoom: () => void;
  estimateStory: (storyKey: string, summary: string) => void;
}

export interface RoomStoreState extends RoomSocketActions {
  roomId: string;
  participant: StoredParticipant | null;
  connectionStatus: SocketConnectionStatus;
  isConnected: boolean;
  isActionLoading: boolean;
  isSwitchingRole: boolean;

  // Sync state updater from socket hook
  setSocketState: (
    state: Partial<
      Pick<
        RoomStoreState,
        'connectionStatus' | 'isConnected' | 'isActionLoading' | 'isSwitchingRole'
      >
    >,
  ) => void;
  setParticipant: (participant: StoredParticipant | null) => void;
  setActions: (actions: Partial<RoomSocketActions>) => void;
}

export type RoomStore = StoreApi<RoomStoreState>;

const NOOP = () => {};

export function createRoomStore(initialProps: {
  roomId: string;
  participant: StoredParticipant | null;
  actions?: Partial<RoomSocketActions>;
}): RoomStore {
  return createStore<RoomStoreState>((set) => ({
    roomId: initialProps.roomId,
    participant: initialProps.participant,
    connectionStatus: 'connecting',
    isConnected: false,
    isActionLoading: false,
    isSwitchingRole: false,

    // Default no-op actions until wired
    joinRoom: initialProps.actions?.joinRoom || NOOP,
    submitEstimate: initialProps.actions?.submitEstimate || NOOP,
    revealCards: initialProps.actions?.revealCards || NOOP,
    nextRound: initialProps.actions?.nextRound || NOOP,
    resetRound: initialProps.actions?.resetRound || NOOP,
    claimFacilitator: initialProps.actions?.claimFacilitator || NOOP,
    switchRole: initialProps.actions?.switchRole || NOOP,
    updateRoomConfig: initialProps.actions?.updateRoomConfig || NOOP,
    startTimer: initialProps.actions?.startTimer || NOOP,
    pauseTimer: initialProps.actions?.pauseTimer || NOOP,
    resumeTimer: initialProps.actions?.resumeTimer || NOOP,
    stopTimer: initialProps.actions?.stopTimer || NOOP,
    addTimerSeconds: initialProps.actions?.addTimerSeconds || NOOP,
    createStickyNote: initialProps.actions?.createStickyNote || (() => ''),
    moveStickyNote: initialProps.actions?.moveStickyNote || NOOP,
    editStickyNote: initialProps.actions?.editStickyNote || NOOP,
    togglePinStickyNote: initialProps.actions?.togglePinStickyNote || NOOP,
    deleteStickyNote: initialProps.actions?.deleteStickyNote || NOOP,
    startEditingStickyNote: initialProps.actions?.startEditingStickyNote || NOOP,
    stopEditingStickyNote: initialProps.actions?.stopEditingStickyNote || NOOP,
    syncJiraPoints: initialProps.actions?.syncJiraPoints || NOOP,
    leaveRoom: initialProps.actions?.leaveRoom || NOOP,
    estimateStory: initialProps.actions?.estimateStory || NOOP,

    setSocketState: (update) => set((prev) => ({ ...prev, ...update })),
    setParticipant: (participant) => set({ participant }),
    setActions: (actions) => set((prev) => ({ ...prev, ...actions })),
  }));
}

const RoomStoreContext = createContext<RoomStore | null>(null);

export interface RoomProviderProps {
  roomId: string;
  participant: StoredParticipant | null;
  actions?: Partial<RoomSocketActions>;
  children: ReactNode;
}

export function RoomProvider({ roomId, participant, actions, children }: RoomProviderProps) {
  const storeRef = useRef<RoomStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createRoomStore({ roomId, participant, actions });
  }

  // Keep participant & actions in sync if props change
  useEffect(() => {
    storeRef.current?.getState().setParticipant(participant);
  }, [participant]);

  useEffect(() => {
    if (actions) {
      storeRef.current?.getState().setActions(actions);
    }
  }, [actions]);

  return <RoomStoreContext.Provider value={storeRef.current}>{children}</RoomStoreContext.Provider>;
}

export function useRoomStore<T>(selector: (state: RoomStoreState) => T): T {
  const store = useContext(RoomStoreContext);
  if (!store) {
    throw new Error('useRoomStore must be used within a RoomProvider');
  }
  return useStore(store, selector);
}

export function useRoomStoreApi(): RoomStore {
  const store = useContext(RoomStoreContext);
  if (!store) {
    throw new Error('useRoomStoreApi must be used within a RoomProvider');
  }
  return store;
}
