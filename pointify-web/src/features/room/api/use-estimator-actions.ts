import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { roomKeys } from './use-room';
import { setStoredParticipant, type StoredParticipant } from '../utils/participant-session';
import type { CardValue, RoomProjection } from '../types/room.types';

export function useEstimatorActions(
  getSocket: () => Socket,
  roomId: string,
  participant: StoredParticipant | null,
  onParticipantJoined?: (p: StoredParticipant) => void,
) {
  const queryClient = useQueryClient();
  const lastEstimateTimeRef = useRef<number>(0);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const roleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Submit Estimate with 400ms rapid-click suppression + optimistic update
  const submitEstimate = useCallback(
    (cardValue: CardValue | null) => {
      if (!participant) return;

      const now = Date.now();
      if (now - lastEstimateTimeRef.current < 400) return;
      lastEstimateTimeRef.current = now;

      // Optimistic update for instant local UI
      queryClient.setQueryData<RoomProjection>(roomKeys.detail(roomId), (old) => {
        if (!old) return old;
        return {
          ...old,
          participants: old.participants.map((p) =>
            p.id === participant.id
              ? { ...p, hasEstimated: cardValue !== null, estimatedValue: cardValue }
              : p,
          ),
        };
      });

      getSocket().emit('room:estimate', {
        roomId,
        participantId: participant.id,
        cardValue,
      });
    },
    [roomId, participant, getSocket, queryClient],
  );

  // Switch Role (Estimator ↔ Spectator) with optimistic update
  const switchRole = useCallback(
    (isSpectator: boolean) => {
      if (!participant || isSwitchingRole) return;

      setIsSwitchingRole(true);
      if (roleTimeoutRef.current) clearTimeout(roleTimeoutRef.current);
      roleTimeoutRef.current = setTimeout(() => setIsSwitchingRole(false), 4000);

      const updated: StoredParticipant = { ...participant, isSpectator };
      setStoredParticipant(roomId, updated);
      onParticipantJoined?.(updated);

      // Optimistic cache update
      queryClient.setQueryData<RoomProjection>(roomKeys.detail(roomId), (old) => {
        if (!old) return old;
        return {
          ...old,
          participants: old.participants.map((p) =>
            p.id === participant.id
              ? {
                  ...p,
                  isSpectator,
                  hasEstimated: isSpectator ? false : p.hasEstimated,
                  estimatedValue: isSpectator ? null : p.estimatedValue,
                }
              : p,
          ),
        };
      });

      getSocket().emit('room:switch-role', {
        roomId,
        participantId: participant.id,
        isSpectator,
      });
    },
    [roomId, participant, getSocket, onParticipantJoined, isSwitchingRole, queryClient],
  );

  const unlockSwitchRole = useCallback(() => {
    setIsSwitchingRole(false);
    if (roleTimeoutRef.current) {
      clearTimeout(roleTimeoutRef.current);
      roleTimeoutRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (roleTimeoutRef.current) clearTimeout(roleTimeoutRef.current);
  }, []);

  return {
    submitEstimate,
    switchRole,
    isSwitchingRole,
    unlockSwitchRole,
    cleanupEstimator: cleanup,
  };
}
