import { useState, useEffect } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useRoomQuery } from '@/features/room/api/use-room';
import { useRoomSocket } from '@/features/room/api/use-room-socket';
import { getFacilitatorKey } from '@/features/room/utils/facilitator-storage';
import {
  getStoredParticipant,
  setStoredParticipant,
  type StoredParticipant,
} from '@/features/room/utils/participant-session';
import { useAuthStore } from '@/store/useAuthStore';
import { DECK_CONFIGS } from '@/features/room/constants/deck-configs';
import { TypographyMuted } from '@/components/ui/typography';
import { Spinner } from '@/components/ui/spinner';
import { NotFoundPage } from '@/components/feedback/not-found';
import { RoomCanvasShell } from '@/features/room/components/canvas/room-canvas-shell';
import { RoomFloatingHeader } from '@/features/room/components/hud/room-floating-header';
import { RoomDeckDock } from '@/features/room/components/hud/room-deck-dock';
import { JoinRoomDialog } from '@/features/room/components/dialogs/join-room-dialog';
import type { CardValue } from '@/features/room/types/room.types';

export const Route = createFileRoute('/rooms/$roomId')({
  component: RoomViewPage,
});

function RoomViewPage() {
  const { roomId } = useParams({ from: '/rooms/$roomId' });
  const { t } = useTranslation();
  const { user } = useAuthStore();

  // 1. Participant Identity Management
  const [participant, setParticipant] = useState<StoredParticipant | null>(() => {
    const stored = getStoredParticipant(roomId);
    if (stored) return stored;

    // Auto-create from authenticated user if available
    if (user?.uid) {
      const authParticipant: StoredParticipant = {
        id: user.uid,
        displayName: user.displayName || 'Tài khoản',
        photoURL: user.photoURL || null,
        isGuest: false,
        isSpectator: false,
      };
      setStoredParticipant(roomId, authParticipant);
      return authParticipant;
    }

    return null;
  });

  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(!participant);

  // Synchronize when auth changes
  useEffect(() => {
    if (!participant && user?.uid) {
      const authParticipant: StoredParticipant = {
        id: user.uid,
        displayName: user.displayName || 'Tài khoản',
        photoURL: user.photoURL || null,
        isGuest: false,
        isSpectator: false,
      };
      setStoredParticipant(roomId, authParticipant);
      setParticipant(authParticipant);
      setIsJoinDialogOpen(false);
    }
  }, [user, roomId, participant]);

  // 2. Real-time WebSocket Gateway Hook
  const {
    connectionStatus,
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
  } = useRoomSocket({
    roomId,
    participant,
    onParticipantJoined: (p) => {
      setParticipant(p);
      setIsJoinDialogOpen(false);
    },
  });

  // 3. Room State Query (seeded and updated live by socket)
  const { data: room, isLoading, error } = useRoomQuery(roomId, participant?.id);

  const storedFacilitatorKey = getFacilitatorKey(roomId);
  const isFacilitator =
    Boolean(storedFacilitatorKey) ||
    Boolean(participant?.id && room?.facilitatorId === participant.id);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Spinner className="size-8 text-primary animate-spin" />
        <TypographyMuted className="text-sm font-medium">
          {t('room.loading', 'Đang kết nối phòng...')}
        </TypographyMuted>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full">
          <NotFoundPage backTo="/" />
        </div>
      </div>
    );
  }

  // Active deck configuration
  const activeDeckConfig = DECK_CONFIGS.find((d) => d.id === room.deckType) || DECK_CONFIGS[0];

  const currentParticipantInRoom = room.participants.find((p) => p.id === participant?.id);
  const selectedCard = currentParticipantInRoom?.estimatedValue ?? null;
  const isSpectator = currentParticipantInRoom?.isSpectator ?? participant?.isSpectator ?? false;
  const isRoundRevealed =
    room.currentRound.status === 'revealed' || room.currentRound.status === 'completed';

  const handleSelectCard = (card: CardValue) => {
    if (selectedCard === card) {
      submitEstimate(null);
    } else {
      submitEstimate(card);
    }
  };

  const handleJoinSubmit = (newParticipant: StoredParticipant) => {
    joinRoom(newParticipant);
    setParticipant(newParticipant);
    setIsJoinDialogOpen(false);
    toast.success(t('room.joinedSuccess', 'Đã tham gia phòng thành công!'));
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background select-none">
      {/* 1. Pre-Lobby Join Dialog if not yet joined */}
      <JoinRoomDialog open={isJoinDialogOpen} roomName={room.name} onJoin={handleJoinSubmit} />

      {/* 2. Floating Top Header Island */}
      <RoomFloatingHeader
        room={room}
        isFacilitator={isFacilitator}
        currentUserId={participant?.id}
        connectionStatus={connectionStatus}
        onSwitchRole={switchRole}
        isSwitchingRole={isSwitchingRole}
        onClaimFacilitator={claimFacilitator}
        isClaimingFacilitator={isActionLoading}
        onUpdateRoomConfig={updateRoomConfig}
      />

      {/* 3. Whiteboard Infinite Canvas Shell (@xyflow/react) */}
      <RoomCanvasShell room={room} currentUserId={participant?.id || ''} />

      {/* 4. Unified Deck Hand Dock & Facilitator Control Strip */}
      <RoomDeckDock
        cards={activeDeckConfig.cards}
        selectedCard={selectedCard}
        onSelectCard={handleSelectCard}
        disabled={isRoundRevealed}
        isFacilitator={isFacilitator}
        isRoundRevealed={isRoundRevealed}
        onReveal={revealCards}
        onNewRound={nextRound}
        onReset={() => nextRound(room.currentRound.topic)}
        isActionLoading={isActionLoading}
        isSpectator={isSpectator}
        timer={room.currentRound.timer}
        onStartTimer={startTimer}
        onPauseTimer={pauseTimer}
        onResumeTimer={resumeTimer}
        onStopTimer={stopTimer}
        onAddTimerSeconds={addTimerSeconds}
      />
    </div>
  );
}
