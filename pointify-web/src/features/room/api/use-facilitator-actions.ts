import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Socket } from 'socket.io-client';
import { getFacilitatorKey, saveFacilitatorKey } from '../utils/facilitator-storage';
import { roomKeys } from './use-room';
import type { DeckType } from '../types/room.types';
import type { StoredParticipant } from '../utils/participant-session';

/* ── DRY Helpers ────────────────────────────────────────────── */

/**
 * Validates facilitator key exists for the room.
 * Returns the key or null (with error toast) if missing.
 */
function guardFacilitatorKey(
  roomId: string,
  t: ReturnType<typeof useTranslation>['t'],
): string | null {
  const key = getFacilitatorKey(roomId);
  if (!key) {
    toast.error(t('room.noFacilitatorKey'));
    return null;
  }
  return key;
}

/**
 * Manages action loading state with auto-reset timeout.
 */
function useActionLock(timeoutMs = 4000) {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lock = useCallback(() => {
    setIsLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsLoading(false), timeoutMs);
  }, [timeoutMs]);

  const unlock = useCallback(() => {
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return { isLoading, lock, unlock, cleanup };
}

/* ── Hook ───────────────────────────────────────────────────── */

export function useFacilitatorActions(
  getSocket: () => Socket,
  roomId: string,
  participant: StoredParticipant | null,
) {
  const queryClient = useQueryClient();
  const { t } = useTranslation('room');
  const { isLoading: isActionLoading, lock, unlock, cleanup } = useActionLock();

  const revealCards = useCallback(() => {
    if (isActionLoading) return;
    const key = guardFacilitatorKey(roomId, t);
    if (!key) return;

    lock();
    getSocket().emit('room:reveal', { roomId, facilitatorKey: key });
  }, [roomId, getSocket, t, isActionLoading, lock]);

  const nextRound = useCallback(
    (nextTopic?: string) => {
      if (isActionLoading) return;
      const key = guardFacilitatorKey(roomId, t);
      if (!key) return;

      lock();
      const topicStr = typeof nextTopic === 'string' ? nextTopic.trim() : undefined;
      getSocket().emit('room:next-round', {
        roomId,
        facilitatorKey: key,
        nextTopic: topicStr,
      });
    },
    [roomId, getSocket, t, isActionLoading, lock],
  );

  const resetRound = useCallback(() => {
    if (isActionLoading) return;
    const key = guardFacilitatorKey(roomId, t);
    if (!key) return;

    lock();
    getSocket().emit('room:reset-round', { roomId, facilitatorKey: key });
  }, [roomId, getSocket, t, isActionLoading, lock]);

  const claimFacilitator = useCallback(() => {
    if (!participant || isActionLoading) return;

    lock();
    getSocket().emit('room:claim-facilitator', {
      roomId,
      claimantId: participant.id,
    });
  }, [roomId, participant, getSocket, isActionLoading, lock]);

  const updateRoomConfig = useCallback(
    (updates: { name?: string; deckType?: DeckType }) => {
      const key = guardFacilitatorKey(roomId, t);
      if (!key) return;

      lock();
      getSocket().emit('room:update-config', {
        roomId,
        facilitatorKey: key,
        ...updates,
      });
    },
    [roomId, getSocket, t, lock],
  );

  /** Handle room:claimed-facilitator event */
  const handleClaimedFacilitator = useCallback(
    (data: { facilitatorKey: string }) => {
      if (data?.facilitatorKey) {
        saveFacilitatorKey(roomId, data.facilitatorKey);
        unlock();
        toast.success(t('room.claimFacilitatorSuccess'));
        void queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
      }
    },
    [roomId, queryClient, t, unlock],
  );

  const syncJiraPoints = useCallback(
    (storyKey: string, points: number | string) => {
      const key = guardFacilitatorKey(roomId, t);
      if (!key) return;

      getSocket().emit('room:jira-sync-points', {
        roomId,
        facilitatorKey: key,
        storyKey,
        points,
      });
    },
    [roomId, getSocket, t],
  );

  return {
    isActionLoading,
    revealCards,
    nextRound,
    resetRound,
    claimFacilitator,
    updateRoomConfig,
    handleClaimedFacilitator,
    syncJiraPoints,
    unlockAction: unlock,
    cleanupAction: cleanup,
  };
}
