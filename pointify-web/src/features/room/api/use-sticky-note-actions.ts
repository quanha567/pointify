import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { roomKeys } from './use-room';
import type {
  RoomProjection,
  StickyNoteProjection,
  StickyNoteColor,
  StickyNotePosition,
  StickyNoteEditingUser,
} from '../types/room.types';
import type { StoredParticipant } from '../utils/participant-session';

/* ── DRY Cache Utility ─────────────────────────────────────── */

/**
 * Updates stickyNotes in the room cache, centralizing null-checks.
 */
function updateStickyNotesCache(
  queryClient: ReturnType<typeof useQueryClient>,
  roomId: string,
  updater: (notes: StickyNoteProjection[]) => StickyNoteProjection[],
) {
  queryClient.setQueryData<RoomProjection>(roomKeys.detail(roomId), (old) => {
    if (!old || !old.stickyNotes) return old;
    return { ...old, stickyNotes: updater(old.stickyNotes) };
  });
}

/* ── Hook ───────────────────────────────────────────────────── */

export function useStickyNoteActions(
  getSocket: () => Socket,
  roomId: string,
  participantRef: React.RefObject<StoredParticipant | null>,
) {
  const queryClient = useQueryClient();
  const lastMoveEmitTimeRef = useRef<number>(0);

  // ── Socket Event Listeners ──────────────────────────────────

  useEffect(() => {
    const socket = getSocket();

    const handleCreated = (data: { note: StickyNoteProjection }) => {
      if (!data?.note) return;
      queryClient.setQueryData<RoomProjection>(roomKeys.detail(roomId), (old) => {
        if (!old) return old;
        const existing = old.stickyNotes || [];
        if (existing.some((n) => n.id === data.note.id)) return old;
        return { ...old, stickyNotes: [...existing, data.note] };
      });
    };

    const handleMoved = (data: { noteId: string; position: StickyNotePosition }) => {
      if (!data?.noteId) return;
      updateStickyNotesCache(queryClient, roomId, (notes) =>
        notes.map((n) => (n.id === data.noteId ? { ...n, position: { ...data.position } } : n)),
      );
    };

    const handleEdited = (data: { noteId: string; text: string; color?: StickyNoteColor }) => {
      if (!data?.noteId) return;
      updateStickyNotesCache(queryClient, roomId, (notes) =>
        notes.map((n) =>
          n.id === data.noteId ? { ...n, text: data.text, color: data.color || n.color } : n,
        ),
      );
    };

    const handlePinned = (data: { noteId: string; isPinned: boolean }) => {
      if (!data?.noteId) return;
      updateStickyNotesCache(queryClient, roomId, (notes) =>
        notes.map((n) => (n.id === data.noteId ? { ...n, isPinned: data.isPinned } : n)),
      );
    };

    const handleDeleted = (data: { noteId: string }) => {
      if (!data?.noteId) return;
      updateStickyNotesCache(queryClient, roomId, (notes) =>
        notes.filter((n) => n.id !== data.noteId),
      );
    };

    const handleEditingChanged = (data: {
      noteId: string;
      editingBy?: StickyNoteEditingUser | null;
    }) => {
      if (!data?.noteId) return;
      updateStickyNotesCache(queryClient, roomId, (notes) =>
        notes.map((n) => (n.id === data.noteId ? { ...n, editingBy: data.editingBy ?? null } : n)),
      );
    };

    socket.on('room:sticky-note-created', handleCreated);
    socket.on('room:sticky-note-moved', handleMoved);
    socket.on('room:sticky-note-edited', handleEdited);
    socket.on('room:sticky-note-pinned', handlePinned);
    socket.on('room:sticky-note-deleted', handleDeleted);
    socket.on('room:sticky-note-editing-changed', handleEditingChanged);

    return () => {
      socket.off('room:sticky-note-created', handleCreated);
      socket.off('room:sticky-note-moved', handleMoved);
      socket.off('room:sticky-note-edited', handleEdited);
      socket.off('room:sticky-note-pinned', handlePinned);
      socket.off('room:sticky-note-deleted', handleDeleted);
      socket.off('room:sticky-note-editing-changed', handleEditingChanged);
    };
  }, [getSocket, roomId, queryClient]);

  // ── Actions ─────────────────────────────────────────────────

  const createStickyNote = useCallback(
    (noteData: {
      id?: string;
      text?: string;
      color?: StickyNoteColor;
      position: StickyNotePosition;
      isPinned?: boolean;
    }) => {
      const socket = getSocket();
      const noteId =
        noteData.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const currentParticipant = participantRef.current;
      const authorId = currentParticipant?.id || 'guest';
      const authorName = currentParticipant?.displayName || 'Anonymous';

      const newNote: StickyNoteProjection = {
        id: noteId,
        roomId,
        text: noteData.text || '',
        color: noteData.color || 'yellow',
        position: noteData.position,
        authorId,
        authorName,
        isPinned: noteData.isPinned ?? false,
        editingBy: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Optimistic cache update
      queryClient.setQueryData<RoomProjection>(roomKeys.detail(roomId), (old) => {
        if (!old) return old;
        return { ...old, stickyNotes: [...(old.stickyNotes || []), newNote] };
      });

      socket.emit('room:sticky-note-create', {
        roomId,
        note: {
          id: noteId,
          text: newNote.text,
          color: newNote.color,
          position: newNote.position,
          authorId,
          authorName,
          isPinned: newNote.isPinned,
        },
      });

      return noteId;
    },
    [getSocket, roomId, queryClient, participantRef],
  );

  const moveStickyNote = useCallback(
    (noteId: string, position: StickyNotePosition, isFinal = false) => {
      // Only update local React Query cache on final drop (isFinal === true).
      // Active dragging is handled natively by React Flow without thrashing global state.
      if (isFinal) {
        updateStickyNotesCache(queryClient, roomId, (notes) =>
          notes.map((n) => (n.id === noteId ? { ...n, position: { ...position } } : n)),
        );
      }

      const now = Date.now();
      if (isFinal || now - lastMoveEmitTimeRef.current > 50) {
        lastMoveEmitTimeRef.current = now;
        getSocket().emit('room:sticky-note-move', { roomId, noteId, position, isFinal });
      }
    },
    [getSocket, roomId, queryClient],
  );

  const editStickyNote = useCallback(
    (noteId: string, text: string, color?: StickyNoteColor) => {
      updateStickyNotesCache(queryClient, roomId, (notes) =>
        notes.map((n) => (n.id === noteId ? { ...n, text, color: color || n.color } : n)),
      );
      getSocket().emit('room:sticky-note-edit', { roomId, noteId, text, color });
    },
    [getSocket, roomId, queryClient],
  );

  const togglePinStickyNote = useCallback(
    (noteId: string) => {
      updateStickyNotesCache(queryClient, roomId, (notes) =>
        notes.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n)),
      );
      getSocket().emit('room:sticky-note-pin', { roomId, noteId });
    },
    [getSocket, roomId, queryClient],
  );

  const deleteStickyNote = useCallback(
    (noteId: string) => {
      updateStickyNotesCache(queryClient, roomId, (notes) => notes.filter((n) => n.id !== noteId));
      getSocket().emit('room:sticky-note-delete', { roomId, noteId });
    },
    [getSocket, roomId, queryClient],
  );

  const startEditingStickyNote = useCallback(
    (noteId: string) => {
      const current = participantRef.current;
      getSocket().emit('room:sticky-note-editing-start', {
        roomId,
        noteId,
        user: { userId: current?.id || 'guest', userName: current?.displayName || 'Anonymous' },
      });
    },
    [getSocket, roomId, participantRef],
  );

  const stopEditingStickyNote = useCallback(
    (noteId: string) => {
      getSocket().emit('room:sticky-note-editing-end', { roomId, noteId });
    },
    [getSocket, roomId],
  );

  const leaveRoom = useCallback(
    (participantId: string) => {
      getSocket().emit('room:leave', { roomId, participantId });
    },
    [getSocket, roomId],
  );

  return {
    createStickyNote,
    moveStickyNote,
    editStickyNote,
    togglePinStickyNote,
    deleteStickyNote,
    startEditingStickyNote,
    stopEditingStickyNote,
    leaveRoom,
  };
}
