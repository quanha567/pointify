import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useRoomQuery } from '../api/use-room';
import { useRoomSocket } from '../api/use-room-socket';
import { useRoomParticipantIdentity } from '../hooks/use-room-participant-identity';
import { useRoomStoreApi } from '../context/room-store-context';
import { useActiveRoom } from '../hooks/use-active-room';
import { TypographyMuted } from '@/components/ui/typography';
import { Spinner } from '@/components/ui/spinner';
import { NotFoundPage } from '@/components/feedback/not-found';
import { RoomCanvasShell } from './canvas/room-canvas-shell';
import { RoomFloatingHeader } from './hud/room-floating-header';
import { RoomDeckDock } from './hud/room-deck-dock';
import { StoryBacklogDrawer } from './hud/story-backlog-drawer';
import { JoinRoomDialog } from './dialogs/join-room-dialog';
import { initAudioUnlockListener } from '../utils/web-audio-chime';
import { useJiraStatus, useSyncStoryPointsMutation } from '@/features/profile/api/jira.api';

export interface RoomPageProps {
  roomId: string;
}

export function RoomPage({ roomId }: RoomPageProps) {
  const { t } = useTranslation('room');
  const store = useRoomStoreApi();

  // 1. Participant identity (session, auth, join dialog)
  const { participant, isJoinDialogOpen, handleJoinSubmit, handleParticipantJoined } =
    useRoomParticipantIdentity(roomId);

  // 2. Unlock Web AudioContext on initial user gesture
  useEffect(() => initAudioUnlockListener(), []);

  // 3. Real-time WebSocket gateway
  const socket = useRoomSocket({
    roomId,
    participant,
    onParticipantJoined: handleParticipantJoined,
  });

  // 4. Room state query (seeded and updated live by socket)
  const { data: room, isLoading, error } = useRoomQuery(roomId, participant?.id);
  const { currentJiraKey } = useActiveRoom();

  // Jira sync mutation & status
  const { data: jiraStatus } = useJiraStatus(false);
  const syncPointsMutation = useSyncStoryPointsMutation();

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
      socket.nextRound(topic);
      if (storyKey) {
        toast.info(t('room.startEstimateForStory', { storyKey }));
      } else {
        toast.info(t('room.startEstimate'));
      }
    },
    [socket, t],
  );

  const handleSyncPoints = useCallback(async () => {
    if (!currentJiraKey || !room) return;
    const consensusPoints = room.currentRound.statistics?.average;

    if (consensusPoints === null || consensusPoints === undefined) {
      toast.error(t('room.noConsensus'));
      return;
    }

    const cloudId = jiraStatus?.defaultCloudId || jiraStatus?.sites[0]?.id;
    if (!cloudId) {
      toast.error(t('jira.notConnected'));
      return;
    }

    try {
      await syncPointsMutation.mutateAsync({
        cloudId,
        issueKey: currentJiraKey,
        points: consensusPoints,
      });
      socket.syncJiraPoints(currentJiraKey, consensusPoints);
      toast.success(t('jira.syncPointsSuccess', { points: consensusPoints, key: currentJiraKey }));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg || t('jira.syncPointsError'));
    }
  }, [currentJiraKey, room, jiraStatus, syncPointsMutation, socket, t]);

  // Sync participant into Zustand store
  useEffect(() => {
    store.getState().setParticipant(participant);
  }, [participant, store]);

  // Sync socket connection state into Zustand store
  useEffect(() => {
    store.getState().setSocketState({
      connectionStatus: socket.connectionStatus,
      isConnected: socket.isConnected,
      isActionLoading: socket.isActionLoading,
      isSwitchingRole: socket.isSwitchingRole,
    });
  }, [
    socket.connectionStatus,
    socket.isConnected,
    socket.isActionLoading,
    socket.isSwitchingRole,
    store,
  ]);

  // Sync socket actions into Zustand store
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
  }, [socket, handleEstimateStory, store]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Spinner className="size-8 text-primary animate-spin" />
        <TypographyMuted className="text-sm font-medium">{t('room.loading')}</TypographyMuted>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <NotFoundPage />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background select-none">
      <JoinRoomDialog
        open={isJoinDialogOpen}
        roomName={room.name}
        roomId={roomId}
        onJoin={(p) => handleJoinSubmit(p, socket.joinRoom)}
      />

      {/* Zero prop drilling — components pull state directly from useActiveRoom & useRoomStore */}
      <RoomFloatingHeader />

      <StoryBacklogDrawer />

      <RoomCanvasShell />

      <RoomDeckDock
        onSyncJiraPoints={handleSyncPoints}
        isSyncingJira={syncPointsMutation.isPending}
      />
    </div>
  );
}
