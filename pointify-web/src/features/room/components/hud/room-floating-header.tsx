import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft, Crown, Loader2, Settings, Share2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SocketConnectionStatus } from '../../api/use-room-socket';
import type { DeckType, RoomProjection } from '../../types/room.types';
import { InviteParticipantDialog } from '../dialogs/invite-participant-dialog';
import { ParticipantsSheet } from '../dialogs/participants-sheet';
import { RoomSettingsDialog, type RoomSettingsDialogHandle } from '../dialogs/room-settings-dialog';

interface RoomFloatingHeaderProps {
  room: RoomProjection;
  isFacilitator: boolean;
  currentUserId?: string;
  connectionStatus?: SocketConnectionStatus;
  onSwitchRole?: (isSpectator: boolean) => void;
  isSwitchingRole?: boolean;
  onClaimFacilitator?: () => void;
  isClaimingFacilitator?: boolean;
  onUpdateRoomConfig?: (config: { name?: string; deckType?: DeckType }) => void;
}

export function RoomFloatingHeader({
  room,
  isFacilitator,
  currentUserId,
  connectionStatus: _connectionStatus = 'connected',
  onSwitchRole,
  isSwitchingRole = false,
  onClaimFacilitator,
  isClaimingFacilitator = false,
  onUpdateRoomConfig,
}: RoomFloatingHeaderProps) {
  const { t } = useTranslation();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const roomSettingsDialogRef = useRef<RoomSettingsDialogHandle>(null);

  const facilitatorParticipant = room.participants.find((p) => p.id === room.facilitatorId);
  const isFacilitatorOffline = facilitatorParticipant && !facilitatorParticipant.isOnline;

  return (
    <header className="absolute top-4 inset-x-4 sm:inset-x-6 z-30 pointer-events-none flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        {/* Left Island: Back + Room Info (Name & Code) */}
        <div className="pointer-events-auto flex items-center gap-2 bg-card/85 backdrop-blur-2xl border border-border/60 border-b-primary/5 rounded-2xl p-1.5 sm:px-2.5 sm:py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_6px_rgba(0,0,0,0.04)]">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            className="rounded-xl size-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 shrink-0 cursor-pointer"
          >
            <Link to="/" title={t('common.back', 'Quay lại')}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div className="h-4.5 w-px bg-border/60 shrink-0" />

          <div className="flex items-center gap-2 pl-0.5 pr-1">
            <h1
              className="text-xs sm:text-sm font-bold tracking-tight text-foreground truncate max-w-[140px] sm:max-w-[220px]"
              title={room.name}
            >
              {room.name}
            </h1>
          </div>
        </div>

        {/* Right Island: Facilitator Badge + Role Switch + Share + Participants Drawer */}
        <div className="pointer-events-auto flex items-center gap-2 bg-card/85 backdrop-blur-2xl border border-border/60 border-b-primary/5 rounded-2xl p-1.5 sm:px-2.5 sm:py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_6px_rgba(0,0,0,0.04)]">
          {/* Share / Invite Button */}
          <Button
            onClick={() => setIsInviteDialogOpen(true)}
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 text-xs font-semibold shadow-xs cursor-pointer h-8 px-2.5"
          >
            <Share2 className="size-3.5 text-primary" />
            <span className="hidden sm:inline">{t('room.invite', 'Mời')}</span>
          </Button>

          {/* Participants Side Drawer */}
          <ParticipantsSheet room={room} currentUserId={currentUserId} />

          {/* Room Settings Button */}
          <Button
            onClick={() => roomSettingsDialogRef.current?.open()}
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 text-xs font-semibold shadow-xs cursor-pointer h-8 px-2.5"
            title={t('room.settings', 'Cài đặt')}
          >
            <Settings className="size-3.5 text-primary" />
            <span className="hidden sm:inline">{t('room.settings', 'Cài đặt')}</span>
          </Button>
        </div>
      </div>

      {/* Host Offline Alert Banner */}
      {isFacilitatorOffline && !isFacilitator && (
        <div className="pointer-events-auto flex items-center justify-between gap-3 bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 rounded-2xl shadow-lg backdrop-blur-md text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500 shrink-0 animate-bounce" />
            <span>
              {t(
                'room.facilitatorOffline',
                'Người điều phối đang ngoại tuyến. Bạn có thể nhận quyền điều phối.',
              )}
            </span>
          </div>
          {onClaimFacilitator && (
            <Button
              size="sm"
              variant="outline"
              disabled={isClaimingFacilitator}
              onClick={onClaimFacilitator}
              className="h-7 px-2.5 text-xs bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-foreground cursor-pointer rounded-xl font-semibold"
            >
              {isClaimingFacilitator ? (
                <Loader2 className="size-3 mr-1 animate-spin text-amber-500" />
              ) : (
                <Crown className="size-3 mr-1 text-amber-500" />
              )}
              {t('room.claimFacilitator', 'Nhận quyền điều phối')}
            </Button>
          )}
        </div>
      )}

      {/* Invite Participant Dialog */}
      <InviteParticipantDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        room={room}
      />

      {/* Room Settings Dialog */}
      <RoomSettingsDialog
        ref={roomSettingsDialogRef}
        room={room}
        isFacilitator={isFacilitator}
        currentUserId={currentUserId}
        onSwitchRole={onSwitchRole}
        isSwitchingRole={isSwitchingRole}
        onUpdateRoomConfig={onUpdateRoomConfig}
      />
    </header>
  );
}
