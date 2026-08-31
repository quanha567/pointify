import { useState } from 'react';
import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Copy,
  Check,
  Crown,
  Users,
  SlidersHorizontal,
  Share2,
  ArrowLeft,
  Sparkles,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

import { useRoomQuery } from '@/features/room/api/use-room';
import { getFacilitatorKey } from '@/features/room/utils/facilitator-storage';
import { useAuthStore } from '@/store/useAuthStore';
import { DECK_CONFIGS } from '@/features/room/constants/deck-configs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TypographyH2, TypographyMuted } from '@/components/ui/typography';
import { Spinner } from '@/components/ui/spinner';
import { NotFoundPage } from '@/components/feedback/not-found';

export const Route = createFileRoute('/rooms/$roomId')({
  component: RoomViewPage,
});

function RoomViewPage() {
  const { roomId } = useParams({ from: '/rooms/$roomId' });
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const { data: room, isLoading, error } = useRoomQuery(roomId, user?.uid);

  const storedFacilitatorKey = getFacilitatorKey(roomId);
  const isFacilitator =
    Boolean(storedFacilitatorKey) || Boolean(user?.uid && room?.facilitatorId === user.uid);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('room.linkCopied', 'Đã sao chép liên kết phòng!'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép liên kết');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success(t('room.codeCopied', 'Đã sao chép mã phòng!'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép mã phòng');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <Spinner className="size-8 text-primary animate-spin" />
        <TypographyMuted className="text-sm font-medium">
          {t('room.loading', 'Đang tải thông tin phòng...')}
        </TypographyMuted>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <NotFoundPage backTo="/" />
      </div>
    );
  }

  const activeDeckConfig = DECK_CONFIGS.find((d) => d.id === room.deckType) || DECK_CONFIGS[0];

  return (
    <div className="min-h-screen bg-background/50 text-foreground pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="rounded-xl text-muted-foreground hover:text-foreground"
            >
              <Link to="/">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                  {room.name}
                </h1>
                <Badge
                  variant="outline"
                  onClick={handleCopyCode}
                  className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 cursor-pointer transition-colors gap-1.5 flex items-center shrink-0"
                >
                  <span>{room.id}</span>
                  {copied ? <Check className="size-3" /> : <Copy className="size-3 opacity-70" />}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {t(`decks.${activeDeckConfig.translationKey}.name`)} • Vòng{' '}
                {room.currentRound.roundNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFacilitator && (
              <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30 gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <Crown className="size-3.5" />
                <span className="hidden sm:inline">Người điều phối</span>
              </Badge>
            )}

            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Share2 className="size-3.5 text-primary" />
              <span className="hidden sm:inline">{t('room.inviteTeam', 'Mời thành viên')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Room Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Estimation Table & Round Controls */}
          <div className="lg:col-span-8 space-y-6">
            {/* Table Arena Card */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Bàn ước lượng
                    </span>
                  </div>
                  <TypographyH2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {room.currentRound.topic || 'Chủ đề: Ước lượng Task'}
                  </TypographyH2>
                </div>

                <Badge
                  variant={room.currentRound.status === 'revealed' ? 'default' : 'secondary'}
                  className="rounded-xl px-3 py-1 text-xs font-semibold capitalize"
                >
                  {room.currentRound.status === 'voting' ? 'Đang bỏ phiếu' : 'Đã lật bài'}
                </Badge>
              </div>

              {/* Voting Table Illustration / Cards View */}
              <div className="min-h-[220px] rounded-2xl border border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Layers className="size-10 text-muted-foreground/60 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Sẵn sàng cho vòng ước lượng
                  </h3>
                  <TypographyMuted className="text-xs mt-1 max-w-sm">
                    Chọn một lá bài từ bộ bài bên dưới để đưa ra điểm ước lượng của bạn.
                  </TypographyMuted>
                </div>
              </div>

              {/* Deck Selection Cards */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <SlidersHorizontal className="size-3.5 text-primary" />
                    Bộ bài: {t(`decks.${activeDeckConfig.translationKey}.name`)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {activeDeckConfig.cards.length} lá bài
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
                  {activeDeckConfig.cards.map((card) => (
                    <motion.button
                      key={card}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      className="h-16 sm:h-20 rounded-xl border border-border/80 bg-card hover:border-primary/80 hover:bg-primary/5 shadow-xs flex flex-col items-center justify-center gap-1 font-bold text-sm sm:text-base text-foreground transition-colors cursor-pointer group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">
                        {card}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Participants List & Room Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Participants Card */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">
                    Thành viên tham gia ({room.participants.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5">
                {room.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                        {p.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">
                            {p.displayName}
                          </span>
                          {p.isFacilitator && <Crown className="size-3 text-amber-500 shrink-0" />}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {p.isSpectator ? 'Quan sát viên' : 'Người ước lượng'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.hasEstimated ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-lg">
                          Đã chọn
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
            </div>

            {/* Quick Share Card */}
            <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-primary/5 via-card to-card p-5 sm:p-6 shadow-sm space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Chia sẻ phòng
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gửi mã hoặc đường dẫn bên dưới cho các thành viên trong nhóm.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted/40 border border-border/70 rounded-xl px-3 py-2 text-xs font-mono font-bold text-center tracking-wider text-foreground select-all">
                  {room.id}
                </div>
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  className="rounded-xl gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
