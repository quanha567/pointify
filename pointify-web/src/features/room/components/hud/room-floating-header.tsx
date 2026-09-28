import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Crown,
  Loader2,
  Settings,
  Share2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { SocketConnectionStatus } from '../../api/use-room-socket';
import type { DeckType, RoomProjection } from '../../types/room.types';
import { InviteParticipantDialog } from '../dialogs/invite-participant-dialog';
import { ParticipantsSheet } from '../dialogs/participants-sheet';
import { RoomSettingsDialog, type RoomSettingsDialogHandle } from '../dialogs/room-settings-dialog';
import { useActiveRoom } from '../../hooks/use-active-room';
import { useRoomStore } from '../../context/room-store-context';

export interface RoomFloatingHeaderProps {
  room?: RoomProjection;
  isFacilitator?: boolean;
  currentUserId?: string;
  connectionStatus?: SocketConnectionStatus;
  onSwitchRole?: (isSpectator: boolean) => void;
  isSwitchingRole?: boolean;
  onClaimFacilitator?: () => void;
  isClaimingFacilitator?: boolean;
  onUpdateRoomConfig?: (config: { name?: string; deckType?: DeckType }) => void;
}

export function RoomFloatingHeader(props: RoomFloatingHeaderProps) {
  const { t } = useTranslation(['room', 'common']);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const roomSettingsDialogRef = useRef<RoomSettingsDialogHandle>(null);

  // Read from store / active room query if not passed via props
  const active = useActiveRoom();
  const room = props.room || active.room;
  const isFacilitator =
    props.isFacilitator !== undefined ? props.isFacilitator : active.isFacilitator;
  const currentUserId = props.currentUserId || useRoomStore((s) => s.participant?.id);
  const switchRole = useRoomStore((s) => s.switchRole);
  const onSwitchRole = props.onSwitchRole || switchRole;
  const isSwitchingRole =
    props.isSwitchingRole !== undefined
      ? props.isSwitchingRole
      : useRoomStore((s) => s.isSwitchingRole);
  const claimFacilitator = useRoomStore((s) => s.claimFacilitator);
  const onClaimFacilitator = props.onClaimFacilitator || claimFacilitator;
  const isClaimingFacilitator =
    props.isClaimingFacilitator !== undefined
      ? props.isClaimingFacilitator
      : useRoomStore((s) => s.isActionLoading);
  const updateRoomConfig = useRoomStore((s) => s.updateRoomConfig);
  const onUpdateRoomConfig = props.onUpdateRoomConfig || updateRoomConfig;

  if (!room) return null;

  const facilitatorParticipant = room.participants.find((p) => p.id === room.facilitatorId);
  const isFacilitatorOffline = facilitatorParticipant && !facilitatorParticipant.isOnline;
  const roomCode = room.id.toUpperCase();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setIsCopiedCode(true);
      toast.success(t('room.codeCopied'));
      setTimeout(() => setIsCopiedCode(false), 2000);
    } catch {
      toast.error('Failed to copy room code');
    }
  };

  return (
    <header className="absolute top-4 inset-x-4 sm:inset-x-6 z-30 pointer-events-none flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        {/* Left Island: Back + Room Info (Name & Code) */}
        <div
          className="pointer-events-auto flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border rounded-lg h-[46px] px-2 sm:px-3 shadow-xs transition-colors"
          style={{ borderTop: '3px solid #E31C79' }}
        >
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            className="rounded-md size-8 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer"
          >
            <Link to="/" title={t('common:common.back')}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div className="h-4 w-px bg-border shrink-0" />

          <div className="flex items-center gap-2 pl-0.5 pr-1">
            <h1
              className="text-sm font-semibold tracking-tight text-foreground truncate max-w-[120px] sm:max-w-[200px]"
              title={room.name}
            >
              {room.name}
            </h1>

            {/* Room Code Badge with 1-Click Copy */}
            <button
              type="button"
              onClick={handleCopyCode}
              title={t('room.copyCode', 'Sao chép mã phòng')}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted px-2 py-1 rounded-md border border-border/80 cursor-pointer transition-colors"
            >
              <span>{roomCode}</span>
              {isCopiedCode ? (
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="size-3 opacity-60" />
              )}
            </button>
          </div>
        </div>

        {/* Right Island: Invite + Participants Drawer + Room Settings */}
        <div
          className="pointer-events-auto flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border rounded-lg h-[46px] px-2 sm:px-3 shadow-xs transition-colors"
          style={{ borderTop: '3px solid #E31C79' }}
        >
          {/* Share / Invite Button (Primary Accent) */}
          <Button
            onClick={() => setIsInviteDialogOpen(true)}
            variant="outline"
            size="sm"
            className="rounded-md gap-1.5 text-sm font-medium shadow-2xs cursor-pointer h-[34px] px-2.5 sm:px-3 border-primary/40 hover:border-primary/70 hover:bg-primary/5 text-foreground transition-colors"
          >
            <Share2 className="size-4 text-primary" />
            <span className="hidden sm:inline">{t('room.invite')}</span>
          </Button>

          {/* Participants Side Drawer */}
          <ParticipantsSheet room={room} currentUserId={currentUserId} />

          {/* Room Settings Button (Neutral Utility) */}
          <Button
            onClick={() => roomSettingsDialogRef.current?.open()}
            variant="outline"
            size="sm"
            className="rounded-md gap-1.5 text-sm font-medium shadow-2xs cursor-pointer h-[34px] px-2.5 sm:px-3 border-border hover:bg-muted text-foreground transition-colors"
            title={t('room.settings')}
          >
            <Settings className="size-4 text-muted-foreground" />
            <span className="hidden sm:inline">{t('room.settings')}</span>
          </Button>
        </div>
      </div>

      {/* Host Offline Alert Banner */}
      {isFacilitatorOffline && !isFacilitator && (
        <div className="pointer-events-auto flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-600/30 text-amber-900 dark:text-amber-200 px-3.5 py-2 rounded-lg shadow-sm backdrop-blur-md text-xs">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4 text-amber-600 shrink-0" />
            <span>{t('room.facilitatorOffline')}</span>
          </div>
          {onClaimFacilitator && (
            <Button
              size="sm"
              variant="outline"
              disabled={isClaimingFacilitator}
              onClick={() => onClaimFacilitator()}
              className="h-7 px-2.5 text-xs bg-amber-500/15 hover:bg-amber-500/25 border-amber-600/30 text-foreground cursor-pointer rounded-md font-semibold"
            >
              {isClaimingFacilitator ? (
                <Loader2 className="size-3 mr-1 animate-spin text-amber-600" />
              ) : (
                <Crown className="size-3 mr-1 text-amber-600" />
              )}
              {t('room.claimFacilitator')}
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
