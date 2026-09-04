import { useState, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Copy,
  Check,
  Crown,
  Users,
  Share2,
  Eye,
  UserCheck,
  AlertTriangle,
  Loader2,
  Settings,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DECK_CONFIGS } from '../../constants/deck-configs';
import { InviteParticipantDialog } from '../dialogs/invite-participant-dialog';
import { RoomSettingsDialog, type RoomSettingsDialogHandle } from '../dialogs/room-settings-dialog';
import type { DeckType, RoomProjection } from '../../types/room.types';
import type { SocketConnectionStatus } from '../../api/use-room-socket';
import { useRoundTimer } from '../../hooks/use-round-timer';

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
  connectionStatus = 'connected',
  onSwitchRole,
  isSwitchingRole = false,
  onClaimFacilitator,
  isClaimingFacilitator = false,
  onUpdateRoomConfig,
}: RoomFloatingHeaderProps) {
  const { t } = useTranslation();
  const [copiedCode, setCopiedCode] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const roomSettingsDialogRef = useRef<RoomSettingsDialogHandle>(null);

  const activeDeckConfig = DECK_CONFIGS.find((d) => d.id === room.deckType) || DECK_CONFIGS[0];

  const isRoundRevealed =
    room.currentRound.status === 'revealed' || room.currentRound.status === 'completed';
  const timerState = useRoundTimer(room.currentRound.timer, isRoundRevealed);

  const currentUserParticipant = room.participants.find((p) => p.id === currentUserId);
  const isCurrentSpectator = currentUserParticipant?.isSpectator ?? false;

  const facilitatorParticipant = room.participants.find((p) => p.id === room.facilitatorId);
  const isFacilitatorOffline = facilitatorParticipant && !facilitatorParticipant.isOnline;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      setCopiedCode(true);
      toast.success(t('room.codeCopied', 'Đã sao chép mã phòng!'));
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('Không thể sao chép mã phòng');
    }
  };

  const onlineCount = room.participants.filter((p) => p.isOnline).length;

  return (
    <header className="absolute top-4 inset-x-4 sm:inset-x-6 z-30 pointer-events-none flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        {/* Left Island: Back + Room Info */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-card/85 backdrop-blur-2xl border border-border/60 border-b-primary/5 rounded-2xl p-1.5 sm:px-3 sm:py-2 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_6px_rgba(0,0,0,0.04)]">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            className="rounded-xl text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          >
            <Link to="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div className="h-6 w-px bg-border/60" />

          <div className="flex flex-col pr-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-foreground truncate max-w-[140px] sm:max-w-[220px]">
                {room.name}
              </h1>
              <Badge
                variant="outline"
                onClick={handleCopyCode}
                className="font-mono text-[10px] px-2 py-0.2 rounded-md bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 cursor-pointer transition-colors gap-1 flex items-center shrink-0"
              >
                <span>{room.id}</span>
                {copiedCode ? (
                  <Check className="size-2.5" />
                ) : (
                  <Copy className="size-2.5 opacity-70" />
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span>
                {t(`decks.${activeDeckConfig.translationKey}.name`)} • Vòng{' '}
                {room.currentRound.roundNumber}
              </span>
              <span className="size-1 rounded-full bg-border" />
              <span className="flex items-center gap-1">
                <span
                  className={`size-1.5 rounded-full ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-500 animate-pulse'
                      : connectionStatus === 'connecting'
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-destructive'
                  }`}
                />
                <span className="hidden sm:inline">
                  {connectionStatus === 'connected'
                    ? 'Đồng bộ trực tiếp'
                    : connectionStatus === 'connecting'
                      ? 'Đang kết nối...'
                      : 'Mất kết nối'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Center Island: Live Synchronized Countdown Timer (Visible to ALL participants in room) */}
        {timerState.isActive && (
          <div className="pointer-events-auto flex items-center gap-1.5 bg-card/90 backdrop-blur-2xl border border-border/70 rounded-2xl px-3 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_6px_rgba(0,0,0,0.04)]">
            <Clock
              className={`size-3.5 ${
                timerState.colorPhase === 'urgent' || timerState.status === 'expired'
                  ? 'text-red-500 animate-pulse'
                  : timerState.colorPhase === 'warning'
                    ? 'text-amber-500'
                    : 'text-primary'
              }`}
            />
            <span
              className={`font-mono text-xs font-bold ${
                timerState.colorPhase === 'urgent' || timerState.status === 'expired'
                  ? 'text-red-500'
                  : timerState.colorPhase === 'warning'
                    ? 'text-amber-500'
                    : 'text-foreground'
              }`}
            >
              {timerState.formattedTime}
            </span>
          </div>
        )}

        {/* Right Island: Facilitator Badge + Role Switch + Share + Participants Drawer */}
        <div className="pointer-events-auto flex items-center gap-2 bg-card/85 backdrop-blur-2xl border border-border/60 border-b-primary/5 rounded-2xl p-1.5 sm:px-2.5 sm:py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_6px_rgba(0,0,0,0.04)]">
          {/* Facilitator Badge */}
          {isFacilitator && (
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-xs">
              <Crown className="size-3.5" />
              <span className="hidden md:inline">{t('room.facilitator', 'Người điều phối')}</span>
            </Badge>
          )}

          {/* Toggle Role Button */}
          {currentUserParticipant && onSwitchRole && (
            <Button
              variant={isCurrentSpectator ? 'outline' : 'ghost'}
              size="sm"
              disabled={isSwitchingRole}
              onClick={() => onSwitchRole(!isCurrentSpectator)}
              className="rounded-xl gap-1 text-xs font-medium cursor-pointer h-8 px-2"
              title={
                isCurrentSpectator
                  ? 'Chuyển sang thành viên ước lượng'
                  : 'Chuyển sang chế độ quan sát'
              }
            >
              {isSwitchingRole ? (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
              ) : isCurrentSpectator ? (
                <>
                  <Eye className="size-3.5 text-sky-500" />
                  <span className="hidden lg:inline text-xs">Quan sát</span>
                </>
              ) : (
                <>
                  <UserCheck className="size-3.5 text-emerald-500" />
                  <span className="hidden lg:inline text-xs">Ước lượng</span>
                </>
              )}
            </Button>
          )}

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
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl gap-1.5 text-xs font-semibold cursor-pointer h-8 px-2.5"
              >
                <Users className="size-3.5 text-primary" />
                <span>
                  {onlineCount}/{room.participants.length}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[380px] p-6">
              <SheetHeader className="pb-4 border-b border-border/60">
                <SheetTitle className="text-base font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    <span>{t('room.participants', 'Thành viên tham gia')}</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-normal">
                    {onlineCount} Online
                  </Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
                {room.participants.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      p.isOnline
                        ? 'border-border/60 bg-muted/20'
                        : 'border-border/30 bg-muted/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="size-8 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                          {p.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background ${
                            p.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">
                            {p.displayName}
                          </span>
                          {p.id === currentUserId && (
                            <span className="text-[10px] text-primary font-medium">(Tôi)</span>
                          )}
                          {p.isFacilitator && <Crown className="size-3 text-amber-500 shrink-0" />}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {p.isSpectator
                            ? t('room.spectator', 'Quan sát viên')
                            : t('room.estimator', 'Người ước lượng')}
                        </span>
                      </div>
                    </div>

                    <div>
                      {p.isSpectator ? (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-lg">
                          Quan sát
                        </Badge>
                      ) : p.hasEstimated ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-lg">
                          {room.currentRound.status === 'revealed' && p.estimatedValue !== null
                            ? p.estimatedValue
                            : 'Đã chọn'}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground text-[10px] px-2 py-0.5 rounded-lg"
                        >
                          Chờ bài
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Room Settings Button */}
          <Button
            onClick={() => roomSettingsDialogRef.current?.open()}
            variant="ghost"
            size="icon-sm"
            className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer size-8"
            title={t('room.settings', 'Cài đặt')}
          >
            <Settings className="size-4" />
          </Button>
        </div>
      </div>

      {/* Host Offline Alert Banner */}
      {isFacilitatorOffline && !isFacilitator && (
        <div className="pointer-events-auto flex items-center justify-between gap-3 bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 rounded-2xl shadow-lg backdrop-blur-md text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500 shrink-0 animate-bounce" />
            <span>Người điều phối đang ngoại tuyến. Bạn có thể nhận quyền điều phối.</span>
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
              Nhận quyền điều phối
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
