import { useState, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  CopyIcon,
  CrownIcon,
  ArchiveIcon,
  LayersIcon,
  ExternalLinkIcon,
  SparklesIcon,
  CheckIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { RoomStatusBadge } from './room-status-badge';
import { useAdminRoomDetailQuery } from '../api/use-admin-rooms';
import type { RoomDetailDialogHandle } from '../types/admin-rooms.types';

export interface RoomDetailDialogProps {
  ref?: React.Ref<RoomDetailDialogHandle>;
  onTakeover?: (roomId: string) => void;
  onCloseRoom?: (roomId: string) => void;
}

export function RoomDetailDialog({ ref, onTakeover, onCloseRoom }: RoomDetailDialogProps) {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'rounds'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  useImperativeHandle(ref, () => ({
    open: (roomId: string) => {
      setSelectedRoomId(roomId);
      setActiveTab('overview');
      setCopiedLink(false);
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      setSelectedRoomId(null);
    },
  }));

  const { data, isLoading } = useAdminRoomDetailQuery(selectedRoomId);
  const room = data?.room;

  const joinUrl = selectedRoomId ? `${window.location.origin}/rooms/${selectedRoomId}` : '';

  const handleCopyLink = () => {
    if (!joinUrl) return;
    void navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    toast.success(t('admin.rooms.toasts.copiedLink', 'Đã sao chép liên kết tham gia phòng'));
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!selectedRoomId) return;
    void navigator.clipboard.writeText(selectedRoomId);
    toast.success(t('admin.rooms.toasts.copiedCode', 'Đã sao chép mã phòng'));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-border bg-card shadow-2xl rounded-lg">
        {/* ONE Container Frame 3px Magenta Top Stripe */}
        <div className="h-[3px] w-full bg-primary shrink-0" />

        <DialogHeader className="p-6 pb-4 border-b border-border/60">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <LayersIcon className="size-4" />
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                  {isLoading ? <Skeleton className="h-6 w-48" /> : room?.name || selectedRoomId}
                </DialogTitle>
                {room && <RoomStatusBadge status={room.status} />}
              </div>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 font-mono mt-0.5">
                <span>{t('admin.rooms.table.roomCode', 'Mã phòng')}:</span>
                <span className="font-bold text-foreground bg-muted px-1.5 py-0.5 rounded text-[11px]">
                  {selectedRoomId}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground hover:text-foreground"
                  onClick={handleCopyCode}
                  title={t('admin.rooms.actions.copyCode', 'Sao chép mã')}
                >
                  <CopyIcon className="size-3" />
                </Button>
              </DialogDescription>
            </div>

            {/* Quick Actions Header */}
            {room && (
              <div className="flex items-center gap-2 shrink-0">
                {onTakeover && (
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
                    onClick={() => {
                      if (selectedRoomId) onTakeover(selectedRoomId);
                    }}
                  >
                    <CrownIcon className="size-3.5" />
                    <span>
                      {t('admin.rooms.actions.joinAsFacilitator', 'Vào phòng (Điều phối)')}
                    </span>
                  </Button>
                )}
                {onCloseRoom && room.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                    onClick={() => {
                      if (selectedRoomId) onCloseRoom(selectedRoomId);
                    }}
                  >
                    <ArchiveIcon className="size-3.5" />
                    <span>{t('admin.rooms.actions.closeRoom', 'Đóng phòng')}</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="px-6 border-b border-border/60 bg-muted/20">
            <TabsList className="bg-transparent h-10 p-0 gap-6 border-b-0">
              <TabsTrigger
                value="overview"
                className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-semibold px-1"
              >
                {t('admin.rooms.tabs.overview', 'Tổng quan')}
              </TabsTrigger>
              <TabsTrigger
                value="participants"
                className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-semibold px-1 gap-1.5"
              >
                <span>{t('admin.rooms.tabs.participants', 'Thành viên')}</span>
                {room && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 font-mono">
                    {room.participants.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="rounds"
                className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-semibold px-1"
              >
                {t('admin.rooms.tabs.rounds', 'Vòng ước lượng')}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : !room ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t('admin.rooms.errors.notFound', 'Không tìm thấy dữ liệu phòng')}
              </div>
            ) : (
              <>
                {/* TAB 1: OVERVIEW */}
                <TabsContent value="overview" className="m-0 space-y-6">
                  {/* Share & QR Code Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border border-border/60 bg-muted/20 items-center">
                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded border border-border/40 shadow-xs self-center mx-auto">
                      <QRCodeSVG value={joinUrl} size={110} level="M" />
                      <span className="text-[10px] text-slate-500 font-mono mt-1 font-semibold">
                        {selectedRoomId}
                      </span>
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-3 justify-center">
                      <div>
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                          {t('admin.rooms.detail.shareUrl', 'Liên kết tham gia phòng')}
                        </h4>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={joinUrl}
                            className="flex-1 h-9 px-3 text-xs font-mono bg-background border border-border rounded text-foreground select-all outline-none"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 gap-1.5 text-xs font-medium"
                            onClick={handleCopyLink}
                          >
                            {copiedLink ? (
                              <>
                                <CheckIcon className="size-3.5 text-emerald-600" />
                                <span>{t('admin.rooms.actions.copied', 'Đã chép')}</span>
                              </>
                            ) : (
                              <>
                                <CopyIcon className="size-3.5" />
                                <span>{t('admin.rooms.actions.copy', 'Sao chép')}</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <div>
                          <span className="font-medium text-foreground">
                            {t('admin.rooms.table.deck', 'Bộ bài')}:
                          </span>{' '}
                          <Badge variant="secondary" className="capitalize text-[11px] ml-1">
                            {room.deckType}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            {t('admin.rooms.detail.version', 'Phiên bản state')}:
                          </span>{' '}
                          <span className="font-mono text-foreground font-semibold ml-1">
                            v{room.version}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deck Cards Preview */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {t('admin.rooms.detail.cardsInDeck', 'Các lá bài trong bộ bài')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {room.deckCards.map((card, idx) => (
                        <div
                          key={`${card}-${idx}`}
                          className="h-10 min-w-8 px-2.5 rounded border border-border/80 bg-card flex items-center justify-center font-mono font-bold text-xs text-foreground shadow-2xs hover:border-primary/50 transition-colors"
                        >
                          {card}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Active Round Card */}
                  <div className="rounded-lg border border-border/60 bg-muted/10 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="size-4 text-primary" />
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                          {t('admin.rooms.detail.currentRound', 'Vòng ước lượng hiện tại')} #
                          {room.currentRound.roundNumber}
                        </h4>
                      </div>
                      <Badge variant="outline" className="capitalize text-[11px] font-medium">
                        {room.currentRound.status}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-foreground">
                      {room.currentRound.topic ||
                        t('admin.rooms.detail.noTopic', 'Chưa có chủ đề / User Story')}
                    </p>

                    {room.currentRound.linkedJiraIssue && (
                      <div className="flex items-center gap-2 p-2 rounded bg-background border border-border text-xs">
                        <Badge variant="secondary" className="font-mono text-[10px] font-bold">
                          {room.currentRound.linkedJiraIssue.key}
                        </Badge>
                        <span className="truncate flex-1 text-muted-foreground">
                          {room.currentRound.linkedJiraIssue.summary}
                        </span>
                        {room.currentRound.linkedJiraIssue.url && (
                          <a
                            href={room.currentRound.linkedJiraIssue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 shrink-0 font-medium"
                          >
                            <span>Jira</span>
                            <ExternalLinkIcon className="size-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TAB 2: PARTICIPANTS */}
                <TabsContent value="participants" className="m-0 space-y-3">
                  <div className="rounded-md border border-border/60 divide-y divide-border/40 overflow-hidden">
                    {room.participants.map((p) => {
                      const initials = p.displayName.slice(0, 2).toUpperCase();
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 bg-card hover:bg-muted/30 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8 border border-border/60">
                              {p.photoURL && <AvatarImage src={p.photoURL} alt={p.displayName} />}
                              <AvatarFallback className="text-xs font-semibold bg-muted">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground text-sm">
                                  {p.displayName}
                                </span>
                                {p.isFacilitator && (
                                  <Badge className="bg-primary/10 text-primary border-primary/25 text-[10px] py-0 px-1.5 font-medium">
                                    {t('admin.rooms.table.facilitator', 'Điều phối')}
                                  </Badge>
                                )}
                                {p.isSpectator && (
                                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                    {t('admin.rooms.detail.spectator', 'Quan sát')}
                                  </Badge>
                                )}
                              </div>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                ID: {p.id}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {p.hasEstimated && (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-[11px]"
                              >
                                {t('admin.rooms.detail.estimated', 'Đã chọn bài')}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                              <span
                                className={`size-2 rounded-full ${
                                  p.isOnline
                                    ? 'bg-emerald-500 animate-pulse'
                                    : 'bg-muted-foreground/40'
                                }`}
                              />
                              <span className="text-[11px]">
                                {p.isOnline
                                  ? t('admin.rooms.detail.online', 'Online')
                                  : t('admin.rooms.detail.offline', 'Offline')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* TAB 3: ROUNDS HISTORY */}
                <TabsContent value="rounds" className="m-0 space-y-4">
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        {t('admin.rooms.detail.totalRoundsConcluded', 'Tổng số vòng đã tổ chức')}
                      </span>
                      <span className="font-mono font-bold text-sm text-primary">
                        {room.roundsHistoryCount + 1}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        'admin.rooms.detail.roundsDesc',
                        'Mỗi vòng tương ứng với một lần các thành viên biểu quyết story point cho User Story.',
                      )}
                    </p>
                  </div>

                  <div className="rounded-md border border-border/60 p-4 bg-card space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <span>
                        Vòng #{room.currentRound.roundNumber}:{' '}
                        {room.currentRound.topic || 'Không có tên'}
                      </span>
                      <Badge variant="secondary" className="capitalize text-[10px]">
                        {room.currentRound.status}
                      </Badge>
                    </div>
                    {room.currentRound.statistics && (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            {t('admin.rooms.detail.consensus', 'Đồng thuận')}:
                          </span>{' '}
                          <span className="font-bold text-foreground">
                            {room.currentRound.statistics.consensus ? 'Có' : 'Không'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {t('admin.rooms.detail.average', 'Trung bình')}:
                          </span>{' '}
                          <span className="font-mono font-bold text-foreground">
                            {room.currentRound.statistics.average ?? '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {t('admin.rooms.detail.median', 'Trung vị')}:
                          </span>{' '}
                          <span className="font-mono font-bold text-foreground">
                            {room.currentRound.statistics.median ?? '-'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
