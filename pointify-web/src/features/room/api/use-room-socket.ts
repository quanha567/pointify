import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { roomKeys } from './use-room';
import { useSocketInstance, type SocketConnectionStatus } from './use-socket-instance';
import { useRoomPresence } from './use-room-presence';
import { useFacilitatorActions } from './use-facilitator-actions';
import { useEstimatorActions } from './use-estimator-actions';
import { useTimerActions } from './use-timer-actions';
import { useStickyNoteActions } from './use-sticky-note-actions';
import { setStoredParticipant, type StoredParticipant } from '../utils/participant-session';
import type { RoomProjection } from '../types/room.types';

export type { SocketConnectionStatus };

export interface UseRoomSocketProps {
  roomId: string;
  participant: StoredParticipant | null;
  onParticipantJoined?: (p: StoredParticipant) => void;
}

export function useRoomSocket({ roomId, participant, onParticipantJoined }: UseRoomSocketProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(['room', 'common']);

  const participantRef = useRef(participant);

  // 1. Socket lifecycle
  const { getSocket, connectionStatus } = useSocketInstance(roomId, participantRef);

  // Keep participant ref in sync and ensure room:join is emitted when participant becomes available
  useEffect(() => {
    participantRef.current = participant;
    if (participant && connectionStatus === 'connected') {
      getSocket().emit('room:join', {
        roomId,
        participant,
      });
    }
  }, [participant, connectionStatus, getSocket, roomId]);

  // 2. Presence tracking
  const { processPresenceUpdate, cleanup: cleanupPresence } = useRoomPresence(participant?.id);

  // 3. Domain action hooks
  const facilitator = useFacilitatorActions(getSocket, roomId, participant);
  const estimator = useEstimatorActions(getSocket, roomId, participant, onParticipantJoined);
  const timer = useTimerActions(getSocket, roomId);
  const stickyNotes = useStickyNoteActions(getSocket, roomId, participantRef);

  // 4. Core room:state and room:error listeners
  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();

    const handleRoomState = (data: { room: RoomProjection }) => {
      if (!data?.room) return;

      // Update React Query cache
      queryClient.setQueryData(roomKeys.detail(roomId), data.room);

      // Clear loading flags
      facilitator.unlockAction();
      estimator.unlockSwitchRole();

      // Process presence delta
      processPresenceUpdate(data.room.participants || []);
    };

    const handleRoomError = (error: { message: string }) => {
      facilitator.unlockAction();
      estimator.unlockSwitchRole();
      toast.error(error?.message || t('common:common.error'));
    };

    socket.on('room:state', handleRoomState);
    socket.on('room:claimed-facilitator', facilitator.handleClaimedFacilitator);
    socket.on('room:error', handleRoomError);

    return () => {
      socket.off('room:state', handleRoomState);
      socket.off('room:claimed-facilitator', facilitator.handleClaimedFacilitator);
      socket.off('room:error', handleRoomError);
      cleanupPresence();
      facilitator.cleanupAction();
      estimator.cleanupEstimator();
    };
  }, [
    roomId,
    getSocket,
    queryClient,
    t,
    processPresenceUpdate,
    cleanupPresence,
    facilitator,
    estimator,
  ]);

  // Join Room Action
  const joinRoom = useCallback(
    (newParticipant: StoredParticipant) => {
      setStoredParticipant(roomId, newParticipant);
      onParticipantJoined?.(newParticipant);
      getSocket().emit('room:join', { roomId, participant: newParticipant });
    },
    [roomId, getSocket, onParticipantJoined],
  );

  // Leave Room Action
  const leaveRoom = useCallback(() => {
    if (!participant) return;
    stickyNotes.leaveRoom(participant.id);
  }, [participant, stickyNotes]);

  // Return identical shape as original — memoized to prevent re-render cascades
  return useMemo(
    () => ({
      connectionStatus,
      isConnected: connectionStatus === 'connected',
      isActionLoading: facilitator.isActionLoading,
      isSwitchingRole: estimator.isSwitchingRole,
      joinRoom,
      submitEstimate: estimator.submitEstimate,
      revealCards: facilitator.revealCards,
      nextRound: facilitator.nextRound,
      resetRound: facilitator.resetRound,
      claimFacilitator: facilitator.claimFacilitator,
      switchRole: estimator.switchRole,
      updateRoomConfig: facilitator.updateRoomConfig,
      startTimer: timer.startTimer,
      pauseTimer: timer.pauseTimer,
      resumeTimer: timer.resumeTimer,
      stopTimer: timer.stopTimer,
      addTimerSeconds: timer.addTimerSeconds,
      createStickyNote: stickyNotes.createStickyNote,
      moveStickyNote: stickyNotes.moveStickyNote,
      editStickyNote: stickyNotes.editStickyNote,
      togglePinStickyNote: stickyNotes.togglePinStickyNote,
      deleteStickyNote: stickyNotes.deleteStickyNote,
      startEditingStickyNote: stickyNotes.startEditingStickyNote,
      stopEditingStickyNote: stickyNotes.stopEditingStickyNote,
      syncJiraPoints: facilitator.syncJiraPoints,
      leaveRoom,
    }),
    [
      connectionStatus,
      facilitator.isActionLoading,
      facilitator.revealCards,
      facilitator.nextRound,
      facilitator.resetRound,
      facilitator.claimFacilitator,
      facilitator.updateRoomConfig,
      facilitator.syncJiraPoints,
      estimator.isSwitchingRole,
      estimator.submitEstimate,
      estimator.switchRole,
      timer.startTimer,
      timer.pauseTimer,
      timer.resumeTimer,
      timer.stopTimer,
      timer.addTimerSeconds,
      stickyNotes.createStickyNote,
      stickyNotes.moveStickyNote,
      stickyNotes.editStickyNote,
      stickyNotes.togglePinStickyNote,
      stickyNotes.deleteStickyNote,
      stickyNotes.startEditingStickyNote,
      stickyNotes.stopEditingStickyNote,
      joinRoom,
      leaveRoom,
    ],
  );
}
