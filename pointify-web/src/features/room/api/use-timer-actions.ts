import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Socket } from 'socket.io-client';
import { getFacilitatorKey } from '../utils/facilitator-storage';
import { roomKeys } from './use-room';
import type { RoomProjection } from '../types/room.types';

export function useTimerActions(getSocket: () => Socket, roomId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const manageTimer = useCallback(
    (
      action: 'start' | 'pause' | 'resume' | 'stop' | 'add_time',
      durationSeconds?: number,
      additionalSeconds?: number,
    ) => {
      const facilitatorKey = getFacilitatorKey(roomId);
      if (!facilitatorKey) {
        toast.error(t('room.noFacilitatorKey', 'Bạn không có khóa điều phối của phòng này'));
        return;
      }

      // Optimistic cache update for instant UI feedback
      queryClient.setQueryData<RoomProjection>(roomKeys.detail(roomId), (old) => {
        if (!old) return old;
        const currentTimer = old.currentRound.timer;

        if (action === 'start' && durationSeconds) {
          return {
            ...old,
            currentRound: {
              ...old.currentRound,
              timer: {
                durationSeconds,
                endsAt: Date.now() + durationSeconds * 1000,
                status: 'running',
              },
            },
          };
        }
        if (action === 'pause' && currentTimer) {
          const remaining = Math.max(0, Math.ceil((currentTimer.endsAt - Date.now()) / 1000));
          return {
            ...old,
            currentRound: {
              ...old.currentRound,
              timer: { ...currentTimer, status: 'paused', remainingSecondsOnPause: remaining },
            },
          };
        }
        if (action === 'resume' && currentTimer) {
          const remaining = currentTimer.remainingSecondsOnPause ?? 0;
          return {
            ...old,
            currentRound: {
              ...old.currentRound,
              timer: {
                ...currentTimer,
                status: 'running',
                endsAt: Date.now() + remaining * 1000,
              },
            },
          };
        }
        if (action === 'stop') {
          return { ...old, currentRound: { ...old.currentRound, timer: null } };
        }
        if (action === 'add_time' && currentTimer) {
          const add = additionalSeconds || 30;
          return {
            ...old,
            currentRound: {
              ...old.currentRound,
              timer: {
                ...currentTimer,
                durationSeconds: currentTimer.durationSeconds + add,
                endsAt: currentTimer.endsAt + add * 1000,
              },
            },
          };
        }
        return old;
      });

      getSocket().emit('room:manage-timer', {
        roomId,
        facilitatorKey,
        action,
        durationSeconds,
        additionalSeconds,
      });
    },
    [roomId, getSocket, t, queryClient],
  );

  const startTimer = useCallback(
    (durationSeconds: number) => manageTimer('start', durationSeconds),
    [manageTimer],
  );
  const pauseTimer = useCallback(() => manageTimer('pause'), [manageTimer]);
  const resumeTimer = useCallback(() => manageTimer('resume'), [manageTimer]);
  const stopTimer = useCallback(() => manageTimer('stop'), [manageTimer]);
  const addTimerSeconds = useCallback(
    (additionalSeconds = 30) => manageTimer('add_time', undefined, additionalSeconds),
    [manageTimer],
  );

  return { startTimer, pauseTimer, resumeTimer, stopTimer, addTimerSeconds };
}
