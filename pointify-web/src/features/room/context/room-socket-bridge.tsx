import { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRoomStoreApi } from './room-store-context';
import { useRoomSocket } from '../api/use-room-socket';
import { useRoomParticipantIdentity } from '../hooks/use-room-participant-identity';

export interface RoomSocketBridgeProps {
  roomId: string;
}

/**
 * Encapsulates the socket connection lifecycle and wires actions & connection
 * status directly into the room Zustand store, without re-rendering RoomPage.
 */
export function RoomSocketBridge({ roomId }: RoomSocketBridgeProps) {
  const store = useRoomStoreApi();
  const { t } = useTranslation('room');

  const { participant, handleParticipantJoined } = useRoomParticipantIdentity(roomId);

  // Sync participant into store only if changed
  useEffect(() => {
    if (participant && store.getState().participant?.id !== participant.id) {
      store.getState().setParticipant(participant);
    }
  }, [participant, store]);

  // Connect socket
  const socket = useRoomSocket({
    roomId,
    participant,
    onParticipantJoined: handleParticipantJoined,
  });

  const socketRef = useRef(socket);
  socketRef.current = socket;

  // Sync socket connection state into Zustand store only if changed
  useEffect(() => {
    const s = store.getState();
    if (
      s.connectionStatus !== socket.connectionStatus ||
      s.isConnected !== socket.isConnected ||
      s.isActionLoading !== socket.isActionLoading ||
      s.isSwitchingRole !== socket.isSwitchingRole
    ) {
      store.getState().setSocketState({
        connectionStatus: socket.connectionStatus,
        isConnected: socket.isConnected,
        isActionLoading: socket.isActionLoading,
        isSwitchingRole: socket.isSwitchingRole,
      });
    }
  }, [
    socket.connectionStatus,
    socket.isConnected,
    socket.isActionLoading,
    socket.isSwitchingRole,
    store,
  ]);

  const handleEstimateStory = useCallback(
    (storyKey: string, summary: string) => {
      const cleanSummary = storyKey
        ? summary.replace(new RegExp(`^(?:${storyKey}[:\\s-]*)+`, 'i'), '').trim()
        : summary.trim();
      const topic = storyKey
        ? cleanSummary
          ? `${storyKey}: ${cleanSummary}`
          : storyKey
        : cleanSummary;
      socketRef.current.nextRound(topic);
      if (storyKey) {
        toast.info(t('room.startEstimateForStory', { storyKey }));
      } else {
        toast.info(t('room.startEstimate'));
      }
    },
    [t],
  );

  // Sync socket actions into Zustand store stably
  useEffect(() => {
    store.getState().setActions({
      joinRoom: socket.joinRoom,
      submitEstimate: socket.submitEstimate,
      revealCards: socket.revealCards,
      nextRound: socket.nextRound,
      resetRound: socket.resetRound,
      claimFacilitator: socket.claimFacilitator,
      switchRole: socket.switchRole,
      updateRoomConfig: socket.updateRoomConfig,
      startTimer: (durationSeconds?: number) => socket.startTimer(durationSeconds ?? 30),
      pauseTimer: socket.pauseTimer,
      resumeTimer: socket.resumeTimer,
      stopTimer: socket.stopTimer,
      addTimerSeconds: (seconds?: number) => socket.addTimerSeconds(seconds ?? 30),
      createStickyNote: socket.createStickyNote,
      moveStickyNote: socket.moveStickyNote,
      editStickyNote: socket.editStickyNote,
      togglePinStickyNote: socket.togglePinStickyNote,
      deleteStickyNote: socket.deleteStickyNote,
      startEditingStickyNote: socket.startEditingStickyNote,
      stopEditingStickyNote: socket.stopEditingStickyNote,
      syncJiraPoints: socket.syncJiraPoints,
      leaveRoom: socket.leaveRoom,
      estimateStory: handleEstimateStory,
    });
  }, [
    socket.joinRoom,
    socket.submitEstimate,
    socket.revealCards,
    socket.nextRound,
    socket.resetRound,
    socket.claimFacilitator,
    socket.switchRole,
    socket.updateRoomConfig,
    socket.startTimer,
    socket.pauseTimer,
    socket.resumeTimer,
    socket.stopTimer,
    socket.addTimerSeconds,
    socket.createStickyNote,
    socket.moveStickyNote,
    socket.editStickyNote,
    socket.togglePinStickyNote,
    socket.deleteStickyNote,
    socket.startEditingStickyNote,
    socket.stopEditingStickyNote,
    socket.syncJiraPoints,
    socket.leaveRoom,
    handleEstimateStory,
    store,
  ]);

  return null;
}
