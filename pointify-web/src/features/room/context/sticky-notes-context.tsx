import { createContext, useContext } from 'react';
import type { StickyNoteColor, StickyNotePosition } from '../types/room.types';

export interface StickyNotesContextValue {
  createStickyNote: (noteData: {
    id?: string;
    text?: string;
    color?: StickyNoteColor;
    position: StickyNotePosition;
    isPinned?: boolean;
  }) => string;
  moveStickyNote: (noteId: string, position: StickyNotePosition, isFinal?: boolean) => void;
  editStickyNote: (noteId: string, text: string, color?: StickyNoteColor) => void;
  togglePinStickyNote: (noteId: string) => void;
  deleteStickyNote: (noteId: string) => void;
  startEditingStickyNote: (noteId: string) => void;
  stopEditingStickyNote: (noteId: string) => void;
  estimateStory?: (storyKey: string, summary: string) => void;
}

export const StickyNotesContext = createContext<StickyNotesContextValue | null>(null);

export function useStickyNotes(): StickyNotesContextValue {
  const ctx = useContext(StickyNotesContext);
  if (!ctx) {
    throw new Error('useStickyNotes must be used within a StickyNotesProvider');
  }
  return ctx;
}
