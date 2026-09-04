import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { env } from '@/config/env';
import { roomKeys } from './use-room';
import { getFacilitatorKey, saveFacilitatorKey } from '../utils/facilitator-storage';
import { setStoredParticipant, type StoredParticipant } from '../utils/participant-session';
import type { CardValue, DeckType, RoomProjection } from '../types/room.types';

export type SocketConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface UseRoomSocketProps {
  roomId: string;
  participant: StoredParticipant | null;
  onParticipantJoined?: (p: StoredParticipant) => void;
}

export function useRoomSocket({ roomId, participant, onParticipantJoined }: UseRoomSocketProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>('connecting');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  // Presence delta tracking & debounce timers
  const previousParticipantsRef = useRef<Map<
    string,
    { displayName: string; isOnline: boolean }
  > | null>(null);
  const leaveDebounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEstimateTimeRef = useRef<number>(0);

  // Keep participant reference in sync without triggering socket teardown/re-join
  const participantRef = useRef(participant);
  useEffect(() => {
    participantRef.current = participant;
  }, [participant]);

  // Helper to get socket or create
  const getSocket = useCallback(() => {
    if (!socketRef.current) {
      const socket = io(env.VITE_API_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
      socketRef.current = socket;
    }
    return socketRef.current;
  }, []);

  // Main Socket Lifecycle
  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();

    const handleConnect = () => {
      setConnectionStatus('connected');
      // If we already have a participant session, join immediately
      const currentParticipant = participantRef.current;
      if (currentParticipant) {
        socket.emit('room:join', {
          roomId,
          participant: currentParticipant,
        });
      }
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const handleConnectError = (error: Error) => {
      console.warn('WebSocket connection error:', error.message);
      setConnectionStatus('disconnected');
    };

    const handleRoomState = (data: { room: RoomProjection }) => {
      if (!data?.room) return;

      // 1. Update React Query cache
      queryClient.setQueryData(roomKeys.detail(roomId), data.room);

      // 2. Clear loading flags and fallback timers
      setIsActionLoading(false);
      setIsSwitchingRole(false);
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
        actionTimeoutRef.current = null;
      }
      if (roleTimeoutRef.current) {
        clearTimeout(roleTimeoutRef.current);
        roleTimeoutRef.current = null;
      }

      // 3. Presence delta detection with 3s debounce for leaves
      const newParticipants = data.room.participants || [];
      const prevMap = previousParticipantsRef.current;

      if (prevMap === null) {
        // Initial hydration: memorize current members without triggering join toasts
        const initialMap = new Map<string, { displayName: string; isOnline: boolean }>();
        newParticipants.forEach((p) => {
          initialMap.set(p.id, { displayName: p.displayName, isOnline: p.isOnline });
        });
        previousParticipantsRef.current = initialMap;
      } else {
        const currentUserId = participantRef.current?.id;

        // Check newly joined or reconnected participants
        newParticipants.forEach((p) => {
          if (p.id === currentUserId) return;

          const prev = prevMap.get(p.id);
          const pendingLeaveTimer = leaveDebounceTimersRef.current.get(p.id);

          if (!prev) {
            // Brand new participant joined
            if (pendingLeaveTimer) {
              clearTimeout(pendingLeaveTimer);
              leaveDebounceTimersRef.current.delete(p.id);
            }
            toast.info(t('room.participantJoined', { name: p.displayName }));
          } else if (!prev.isOnline && p.isOnline) {
            // Reconnected: if reconnected before the 3s debounce fired, cancel the leave toast!
            if (pendingLeaveTimer) {
              clearTimeout(pendingLeaveTimer);
              leaveDebounceTimersRef.current.delete(p.id);
            } else {
              toast.info(t('room.participantJoined', { name: p.displayName }));
            }
          } else if (prev.isOnline && !p.isOnline) {
            // Went offline: schedule 3s debounced toast to ignore reload jitter
            if (!pendingLeaveTimer) {
              const name = p.displayName;
              const timer = setTimeout(() => {
                leaveDebounceTimersRef.current.delete(p.id);
                toast.info(t('room.participantLeft', { name }));
              }, 3000);
              leaveDebounceTimersRef.current.set(p.id, timer);
            }
          }
        });

        // Check participants removed completely from the list
        prevMap.forEach((prevVal, prevId) => {
          if (prevId === currentUserId) return;
          const stillPresent = newParticipants.some((p) => p.id === prevId);
          if (!stillPresent && !leaveDebounceTimersRef.current.has(prevId)) {
            const name = prevVal.displayName;
            const timer = setTimeout(() => {
              leaveDebounceTimersRef.current.delete(prevId);
              toast.info(t('room.participantLeft', { name }));
            }, 3000);
            leaveDebounceTimersRef.current.set(prevId, timer);
          }
        });

        // Update stored map
        const updatedMap = new Map<string, { displayName: string; isOnline: boolean }>();
        newParticipants.forEach((p) => {
          updatedMap.set(p.id, { displayName: p.displayName, isOnline: p.isOnline });
        });
        previousParticipantsRef.current = updatedMap;
      }
    };

    const handleClaimedFacilitator = (data: { facilitatorKey: string }) => {
      if (data?.facilitatorKey) {
        saveFacilitatorKey(roomId, data.facilitatorKey);
        setIsActionLoading(false);
        if (actionTimeoutRef.current) {
          clearTimeout(actionTimeoutRef.current);
          actionTimeoutRef.current = null;
        }
        toast.success(t('room.claimFacilitatorSuccess', 'Bạn đã nhận quyền Điều phối viên phòng!'));
        void queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
      }
    };

    const handleRoomError = (error: { message: string }) => {
      setIsActionLoading(false);
      setIsSwitchingRole(false);
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
        actionTimeoutRef.current = null;
      }
      if (roleTimeoutRef.current) {
        clearTimeout(roleTimeoutRef.current);
        roleTimeoutRef.current = null;
      }
      toast.error(error?.message || t('common.error', 'Có lỗi xảy ra'));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('room:state', handleRoomState);
    socket.on('room:claimed-facilitator', handleClaimedFacilitator);
    socket.on('room:error', handleRoomError);

    // Initial trigger if already connected
    const currentParticipant = participantRef.current;
    if (socket.connected && currentParticipant) {
      socket.emit('room:join', {
        roomId,
        participant: currentParticipant,
      });
      setConnectionStatus('connected');
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('room:state', handleRoomState);
      socket.off('room:claimed-facilitator', handleClaimedFacilitator);
      socket.off('room:error', handleRoomError);

      // Clear all presence debounce timers
      leaveDebounceTimersRef.current.forEach((timer) => clearTimeout(timer));
      leaveDebounceTimersRef.current.clear();
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
      if (roleTimeoutRef.current) clearTimeout(roleTimeoutRef.current);
    };
  }, [roomId, getSocket, queryClient, t]);

  // Join Room Action
  const joinRoom = useCallback(
    (newParticipant: StoredParticipant) => {
      setStoredParticipant(roomId, newParticipant);
      onParticipantJoined?.(newParticipant);

      const socket = getSocket();
      socket.emit('room:join', {
        roomId,
        participant: newParticipant,
      });
    },
    [roomId, getSocket, onParticipantJoined],
  );

  // Submit Estimate Action (Optimistic with 400ms rapid-click suppression)
  const submitEstimate = useCallback(
    (cardValue: CardValue | null) => {
      if (!participant) return;

      const now = Date.now();
      if (now - lastEstimateTimeRef.current < 400) {
        return;
      }
      lastEstimateTimeRef.current = now;

      const socket = getSocket();

      // Optimistic query update for instant local UI responsiveness
      queryClient.setQueryData<RoomProjection>(roomKeys.detail(roomId), (old) => {
        if (!old) return old;
        return {
          ...old,
          participants: old.participants.map((p) =>
            p.id === participant.id
              ? {
                  ...p,
                  hasEstimated: cardValue !== null,
                  estimatedValue: cardValue,
                }
              : p,
          ),
        };
      });

      socket.emit('room:estimate', {
        roomId,
        participantId: participant.id,
        cardValue,
      });
    },
    [roomId, participant, getSocket, queryClient],
  );

  // Reveal Cards Action (Facilitator Only - with in-flight lock)
  const revealCards = useCallback(() => {
    if (isActionLoading) return;

    const facilitatorKey = getFacilitatorKey(roomId);
    if (!facilitatorKey) {
      toast.error(t('room.noFacilitatorKey', 'Bạn không có khóa điều phối của phòng này'));
      return;
    }

    setIsActionLoading(true);
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    actionTimeoutRef.current = setTimeout(() => setIsActionLoading(false), 4000);

    const socket = getSocket();
    socket.emit('room:reveal', {
      roomId,
      facilitatorKey,
    });
  }, [roomId, getSocket, t, isActionLoading]);

  // Next Round Action (Facilitator Only - with in-flight lock)
  const nextRound = useCallback(
    (nextTopic?: string) => {
      if (isActionLoading) return;

      const facilitatorKey = getFacilitatorKey(roomId);
      if (!facilitatorKey) {
        toast.error(t('room.noFacilitatorKey', 'Bạn không có khóa điều phối của phòng này'));
        return;
      }

      setIsActionLoading(true);
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
      actionTimeoutRef.current = setTimeout(() => setIsActionLoading(false), 4000);

      const socket = getSocket();
      socket.emit('room:next-round', {
        roomId,
        facilitatorKey,
        nextTopic,
      });
    },
    [roomId, getSocket, t, isActionLoading],
  );

  // Claim Facilitator Action (with in-flight lock)
  const claimFacilitator = useCallback(() => {
    if (!participant || isActionLoading) return;

    setIsActionLoading(true);
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    actionTimeoutRef.current = setTimeout(() => setIsActionLoading(false), 4000);

    const socket = getSocket();
    socket.emit('room:claim-facilitator', {
      roomId,
      claimantId: participant.id,
    });
  }, [roomId, participant, getSocket, isActionLoading]);

  // Switch Role Action (Estimator <-> Spectator with in-flight lock & optimistic update)
  const switchRole = useCallback(
    (isSpectator: boolean) => {
      if (!participant || isSwitchingRole) return;

      setIsSwitchingRole(true);
      if (roleTimeoutRef.current) clearTimeout(roleTimeoutRef.current);
      roleTimeoutRef.current = setTimeout(() => setIsSwitchingRole(false), 4000);

      const updated: StoredParticipant = {
        ...participant,
        isSpectator,
      };
      setStoredParticipant(roomId, updated);
      onParticipantJoined?.(updated);

      // Optimistic update for room query data so UI immediately reflects the new role!
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

      const socket = getSocket();
      socket.emit('room:switch-role', {
        roomId,
        participantId: participant.id,
        isSpectator,
      });
    },
    [roomId, participant, getSocket, onParticipantJoined, isSwitchingRole, queryClient],
  );

  // Update Room Configuration Action (Facilitator Only)
  const updateRoomConfig = useCallback(
    (updates: { name?: string; deckType?: DeckType }) => {
      const facilitatorKey = getFacilitatorKey(roomId);
      if (!facilitatorKey) {
        toast.error(t('room.noFacilitatorKey', 'Bạn không có khóa điều phối của phòng này'));
        return;
      }

      setIsActionLoading(true);
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
      actionTimeoutRef.current = setTimeout(() => setIsActionLoading(false), 4000);

      const socket = getSocket();
      socket.emit('room:update-config', {
        roomId,
        facilitatorKey,
        ...updates,
      });
    },
    [roomId, getSocket, t],
  );

  // Timer Actions (Facilitator Only)
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
              timer: {
                ...currentTimer,
                status: 'paused',
                remainingSecondsOnPause: remaining,
              },
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
          return {
            ...old,
            currentRound: {
              ...old.currentRound,
              timer: null,
            },
          };
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

      const socket = getSocket();
      socket.emit('room:manage-timer', {
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

  // Leave Room Action
  const leaveRoom = useCallback(() => {
    if (!participant) return;
    const socket = getSocket();
    socket.emit('room:leave', {
      roomId,
      participantId: participant.id,
    });
  }, [roomId, participant, getSocket]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isActionLoading,
    isSwitchingRole,
    joinRoom,
    submitEstimate,
    revealCards,
    nextRound,
    claimFacilitator,
    switchRole,
    updateRoomConfig,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addTimerSeconds,
    leaveRoom,
  };
}
