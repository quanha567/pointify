import { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ParticipantProjection } from '../types/room.types';

export interface PresenceToast {
  type: 'joined' | 'left';
  name: string;
}

/**
 * Pure function that computes presence delta between previous and new participant lists.
 * Returns toast notifications to fire and the updated tracking map.
 * Caller manages debounce timers for leave events.
 */
export function computePresenceDelta(
  prevMap: Map<string, { displayName: string; isOnline: boolean }> | null,
  newParticipants: ParticipantProjection[],
  currentUserId: string | undefined,
  pendingLeaveIds: Set<string>,
): {
  toasts: PresenceToast[];
  cancelledLeaves: string[];
  scheduledLeaves: Array<{ id: string; name: string }>;
  updatedMap: Map<string, { displayName: string; isOnline: boolean }>;
} {
  const toasts: PresenceToast[] = [];
  const cancelledLeaves: string[] = [];
  const scheduledLeaves: Array<{ id: string; name: string }> = [];

  if (prevMap === null) {
    // Initial hydration: memorize without triggering toasts
    const initialMap = new Map<string, { displayName: string; isOnline: boolean }>();
    newParticipants.forEach((p) => {
      initialMap.set(p.id, { displayName: p.displayName, isOnline: p.isOnline });
    });
    return { toasts: [], cancelledLeaves: [], scheduledLeaves: [], updatedMap: initialMap };
  }

  // Check newly joined or reconnected participants
  newParticipants.forEach((p) => {
    if (p.id === currentUserId) return;

    const prev = prevMap.get(p.id);
    const hasPendingLeave = pendingLeaveIds.has(p.id);

    if (!prev) {
      // Brand new participant joined
      if (hasPendingLeave) {
        cancelledLeaves.push(p.id);
      }
      toasts.push({ type: 'joined', name: p.displayName });
    } else if (!prev.isOnline && p.isOnline) {
      // Reconnected
      if (hasPendingLeave) {
        cancelledLeaves.push(p.id);
      } else {
        toasts.push({ type: 'joined', name: p.displayName });
      }
    } else if (prev.isOnline && !p.isOnline) {
      // Went offline: schedule debounced leave
      if (!hasPendingLeave) {
        scheduledLeaves.push({ id: p.id, name: p.displayName });
      }
    }
  });

  // Check participants removed completely from the list
  prevMap.forEach((prevVal, prevId) => {
    if (prevId === currentUserId) return;
    const stillPresent = newParticipants.some((p) => p.id === prevId);
    if (!stillPresent && !pendingLeaveIds.has(prevId)) {
      scheduledLeaves.push({ id: prevId, name: prevVal.displayName });
    }
  });

  // Build updated map
  const updatedMap = new Map<string, { displayName: string; isOnline: boolean }>();
  newParticipants.forEach((p) => {
    updatedMap.set(p.id, { displayName: p.displayName, isOnline: p.isOnline });
  });

  return { toasts, cancelledLeaves, scheduledLeaves, updatedMap };
}

/**
 * Hook managing presence delta tracking with 3s debounced leave toasts.
 */
export function useRoomPresence(currentUserId: string | undefined) {
  const { t } = useTranslation();
  const previousParticipantsRef = useRef<Map<
    string,
    { displayName: string; isOnline: boolean }
  > | null>(null);
  const leaveDebounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const processPresenceUpdate = useCallback(
    (newParticipants: ParticipantProjection[]) => {
      const pendingLeaveIds = new Set(leaveDebounceTimersRef.current.keys());

      const { toasts, cancelledLeaves, scheduledLeaves, updatedMap } = computePresenceDelta(
        previousParticipantsRef.current,
        newParticipants,
        currentUserId,
        pendingLeaveIds,
      );

      // Cancel debounced leaves for reconnected participants
      cancelledLeaves.forEach((id) => {
        const timer = leaveDebounceTimersRef.current.get(id);
        if (timer) {
          clearTimeout(timer);
          leaveDebounceTimersRef.current.delete(id);
        }
      });

      // Fire join toasts immediately
      toasts.forEach((t_) => {
        if (t_.type === 'joined') {
          toast.info(t('room.participantJoined', { name: t_.name }));
        }
      });

      // Schedule debounced leave toasts (3s)
      scheduledLeaves.forEach(({ id, name }) => {
        const timer = setTimeout(() => {
          leaveDebounceTimersRef.current.delete(id);
          toast.info(t('room.participantLeft', { name }));
        }, 3000);
        leaveDebounceTimersRef.current.set(id, timer);
      });

      previousParticipantsRef.current = updatedMap;
    },
    [currentUserId, t],
  );

  const cleanup = useCallback(() => {
    leaveDebounceTimersRef.current.forEach((timer) => clearTimeout(timer));
    leaveDebounceTimersRef.current.clear();
  }, []);

  return { processPresenceUpdate, cleanup };
}
