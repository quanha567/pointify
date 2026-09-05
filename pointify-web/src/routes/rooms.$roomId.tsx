import { useEffect } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useRoomQuery } from '@/features/room/api/use-room';
import { useRoomSocket } from '@/features/room/api/use-room-socket';
import { getFacilitatorKey } from '@/features/room/utils/facilitator-storage';
import { useRoomParticipantIdentity } from '@/features/room/hooks/use-room-participant-identity';
import { DECK_CONFIGS } from '@/features/room/constants/deck-configs';
import { TypographyMuted } from '@/components/ui/typography';
import { Spinner } from '@/components/ui/spinner';
import { NotFoundPage } from '@/components/feedback/not-found';
import { RoomCanvasShell } from '@/features/room/components/canvas/room-canvas-shell';
import { RoomFloatingHeader } from '@/features/room/components/hud/room-floating-header';
import { RoomDeckDock } from '@/features/room/components/hud/room-deck-dock';
import { JoinRoomDialog } from '@/features/room/components/dialogs/join-room-dialog';
import { initAudioUnlockListener } from '@/features/room/utils/web-audio-chime';
import type { CardValue } from '@/features/room/types/room.types';

export const Route = createFileRoute('/rooms/$roomId')({
  component: RoomViewPage,
});

function RoomViewPage() {
  const { roomId } = useParams({ from: '/rooms/$roomId' });
  const { t } = useTranslation();

  // 1. Participant identity (session, auth, join dialog)
  const { participant, isJoinDialogOpen, handleJoinSubmit, handleParticipantJoined } =
    useRoomParticipantIdentity(roomId);

  // 2. Unlock Web AudioContext on initial user gesture
  useEffect(() => initAudioUnlockListener(), []);

  // 3. Real-time WebSocket gateway
  const {
    connectionStatus,
    isActionLoading,
    isSwitchingRole,
    joinRoom,
    submitEstimate,
    revealCards,
    nextRound,
    resetRound,
    claimFacilitator,
    switchRole,
    updateRoomConfig,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addTimerSeconds,
    createStickyNote,
    moveStickyNote,
    editStickyNote,
    togglePinStickyNote,
    deleteStickyNote,
    startEditingStickyNote,
    stopEditingStickyNote,
  } = useRoomSocket({
    roomId,
    participant,
    onParticipantJoined: handleParticipantJoined,
  });

  // 4. Room state query (seeded and updated live by socket)
  const { data: room, isLoading, error } = useRoomQuery(roomId, participant?.id);

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

  // Derived state
  const isFacilitator =
    Boolean(getFacilitatorKey(roomId)) ||
    Boolean(participant?.id && room.facilitatorId === participant.id);
  const activeDeckConfig = DECK_CONFIGS.find((d) => d.id === room.deckType) || DECK_CONFIGS[0];
  const currentParticipantInRoom = room.participants.find((p) => p.id === participant?.id);
  const selectedCard = currentParticipantInRoom?.estimatedValue ?? null;
  const isSpectator = currentParticipantInRoom?.isSpectator ?? participant?.isSpectator ?? false;
  const isRoundRevealed =
    room.currentRound.status === 'revealed' || room.currentRound.status === 'completed';

  const handleSelectCard = (card: CardValue) => {
    submitEstimate(selectedCard === card ? null : card);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background select-none">
      <JoinRoomDialog
        open={isJoinDialogOpen}
        roomName={room.name}
        onJoin={(p) => handleJoinSubmit(p, joinRoom)}
      />

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

      <RoomCanvasShell
        room={room}
        currentUserId={participant?.id || ''}
        stickyNoteActions={{
          createStickyNote,
          moveStickyNote,
          editStickyNote,
          togglePinStickyNote,
          deleteStickyNote,
          startEditingStickyNote,
          stopEditingStickyNote,
        }}
      />

      <RoomDeckDock
        cards={activeDeckConfig.cards}
        selectedCard={selectedCard}
        onSelectCard={handleSelectCard}
        disabled={isRoundRevealed}
        isFacilitator={isFacilitator}
        isRoundRevealed={isRoundRevealed}
        onReveal={revealCards}
        onNewRound={() => nextRound()}
        onReset={resetRound}
        isActionLoading={isActionLoading}
        isSpectator={isSpectator}
        timer={room.currentRound.timer}
        onStartTimer={startTimer}
        onPauseTimer={pauseTimer}
        onResumeTimer={resumeTimer}
        onStopTimer={stopTimer}
        onAddTimerSeconds={addTimerSeconds}
        roundId={`${room.currentRound.roundNumber}-${room.currentRound.startedAt}`}
        deckType={room.deckType}
      />
    </div>
  );
}
