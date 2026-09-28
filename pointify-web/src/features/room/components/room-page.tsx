import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useRoomQuery } from '../api/use-room';
import { useRoomStore, useRoomStoreApi } from '../context/room-store-context';
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
import type { StoredParticipant } from '../utils/participant-session';
import { useAuthStore } from '@/store/useAuthStore';

export interface RoomPageProps {
  roomId: string;
}

export function RoomPage({ roomId }: RoomPageProps) {
  const { t } = useTranslation('room');
  const { user, isInitialized } = useAuthStore();
  const store = useRoomStoreApi();

  // 1. Unlock Web AudioContext on initial user gesture
  useEffect(() => initAudioUnlockListener(), []);

  // 2. Selectors from Room Zustand Store
  const participant = useRoomStore((s) => s.participant);
  const joinRoom = useRoomStore((s) => s.joinRoom);
  const syncJiraPoints = useRoomStore((s) => s.syncJiraPoints);

  // Dialog only opens for unauthenticated guests after auth has finished initializing
  const isJoinDialogOpen = isInitialized && !participant && !user?.uid;

  // 3. Room state query (seeded and updated live by socket via React Query cache)
  const { data: room, isLoading, error } = useRoomQuery(roomId, participant?.id);
  const { currentJiraKey } = useActiveRoom();

  // Jira sync mutation & status
  const { data: jiraStatus } = useJiraStatus(false);
  const syncPointsMutation = useSyncStoryPointsMutation();

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
      syncJiraPoints(currentJiraKey, consensusPoints);
      toast.success(t('jira.syncPointsSuccess', { points: consensusPoints, key: currentJiraKey }));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg || t('jira.syncPointsError'));
    }
  }, [currentJiraKey, room, jiraStatus, syncPointsMutation, syncJiraPoints, t]);

  const handleJoin = useCallback(
    (newParticipant: StoredParticipant) => {
      joinRoom(newParticipant);
      store.getState().setParticipant(newParticipant);
      toast.success(t('room.joinedSuccess'));
    },
    [joinRoom, store, t],
  );

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
        onJoin={handleJoin}
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
