import { memo, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { RoomProjection } from '../../types/room.types';
import { Badge } from '@/components/ui/badge';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';
import { PokerStoryCardFront } from '../cards/poker-story-card-front';
import { useRoundTimer } from '../../hooks/use-round-timer';

/* ── Grouped Card Stacks (revealed state) ──────────────────── */

function RevealedCardStacks({ distribution }: { distribution: Record<string, number> }) {
  const entries = useMemo(
    () => Object.entries(distribution).sort(([, a], [, b]) => b - a),
    [distribution],
  );

  if (entries.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-2.5 flex-wrap">
      {entries.map(([value, count], idx) => (
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3 + idx * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="relative perspective-800">
            <div className="w-14 h-21 sm:w-16 sm:h-24 preserve-3d rotate-x-2 drop-shadow-md">
              <PokerStoryCardFront value={value} compact />
            </div>
            {count > 1 && (
              <span className="absolute -top-2 -right-2 size-5.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-card z-20">
                ×{count}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface TableArenaNodeProps {
  data: {
    room?: RoomProjection;
  };
}

/* ── Main Component ────────────────────────────────────────── */

export const TableArenaNode = memo(function TableArenaNode({ data }: TableArenaNodeProps) {
  const { t } = useTranslation();
  const room = data.room;
  const prevRevealedRef = useRef(false);

  const isRevealed =
    room?.currentRound.status === 'revealed' || room?.currentRound.status === 'completed';
  const hasConsensus = Boolean(room?.currentRound.statistics?.consensus);

  const timerState = useRoundTimer(room?.currentRound.timer, isRevealed);

  // Trigger celebration confetti when consensus is revealed
  useEffect(() => {
    if (isRevealed && !prevRevealedRef.current && hasConsensus) {
      try {
        void confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
        });
      } catch (err) {
        console.warn('Failed to fire confetti:', err);
      }
    }
    prevRevealedRef.current = isRevealed;
  }, [isRevealed, hasConsensus]);

  if (!room) return null;

  const { currentRound, participants } = room;
  const totalEstimators = participants.filter((p) => !p.isSpectator);
  const votedCount = totalEstimators.filter((p) => p.hasEstimated).length;
  const stats = currentRound.statistics;

  return (
    <div className="perspective-1000">
      {/* Outer Bezel Rim (Double Bezel squircle structure) */}
      <div
        className={`w-[600px] min-h-[320px] rounded-[2.5rem] p-2 transition-all duration-500 preserve-3d rotate-x-1 ${
          isRevealed && hasConsensus
            ? 'bg-gradient-to-b from-emerald-500/25 via-border/50 to-emerald-500/25 shadow-[0_20px_50px_rgba(16,185,129,0.18),0_4px_16px_rgba(16,185,129,0.10)] ring-1 ring-emerald-500/40'
            : 'bg-gradient-to-b from-border/70 via-border/30 to-border/70 shadow-[0_24px_54px_-12px_rgba(0,0,0,0.14),0_8px_24px_-4px_rgba(0,0,0,0.06)] ring-1 ring-border/60'
        }`}
      >
        {/* Inner Digital Felt Arena Surface */}
        <div
          className={`w-full h-full min-h-[304px] rounded-[2rem] border bg-gradient-to-b from-card via-card to-card/95 p-6 relative overflow-hidden flex flex-col justify-between select-none backdrop-blur-md ${
            isRevealed && hasConsensus ? 'border-emerald-500/50' : 'border-border/70 shadow-inner'
          }`}
        >
          {/* Subtle Ambient Felt Radial Highlight */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06)_0%,transparent_75%)] pointer-events-none" />

          {/* Top Edge Metallic Glow Stroke */}
          <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />

          {/* Header Info */}
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted/60 border border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                {t('room.round', 'Vòng')} {currentRound.roundNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isRevealed && hasConsensus && (
                <Badge className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full gap-1.5 animate-pulse shadow-sm font-semibold">
                  <Sparkles className="size-3.5" /> {t('room.consensus100', '100% Đồng thuận')}
                </Badge>
              )}
              <Badge
                variant={isRevealed ? 'default' : 'secondary'}
                className="rounded-full px-3 py-1 text-xs font-semibold shrink-0 border border-border/50 shadow-xs"
              >
                {isRevealed
                  ? t('room.statusRevealed', 'Đã lật bài')
                  : t('room.statusVoting', 'Đang bỏ phiếu')}
              </Badge>
            </div>
          </div>

          {/* Center Table Content */}
          <div className="my-2 flex-1 flex flex-col items-center justify-center relative z-10">
            <AnimatePresence mode="wait">
              {!isRevealed ? (
                /* ── VOTING STATE: Topic + Progress Ring / Countdown Timer ── */
                <motion.div
                  key="voting-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col items-center text-center space-y-4 py-2"
                >
                  {/* Adaptive Ring Display: Single Ring (when idle) or Dual Symmetrical Rings (when timer active) */}
                  {!timerState.isActive ? (
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      className="relative flex items-center justify-center"
                    >
                      <AnimatedCircularProgressBar
                        max={totalEstimators.length || 1}
                        min={0}
                        value={votedCount}
                        gaugePrimaryColor={
                          votedCount === totalEstimators.length && totalEstimators.length > 0
                            ? '#10b981'
                            : '#d40d65'
                        }
                        gaugeSecondaryColor="rgba(156, 163, 175, 0.35)"
                        className="size-36"
                      >
                        <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-none">
                          {votedCount}/{totalEstimators.length}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">
                          {t('room.voted', 'đã chọn')}
                        </span>
                      </AnimatedCircularProgressBar>
                    </motion.div>
                  ) : (
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      className="flex items-center justify-center gap-6 sm:gap-10"
                    >
                      {/* Left Ring: Estimation Progress */}
                      <div className="relative flex items-center justify-center">
                        <AnimatedCircularProgressBar
                          max={totalEstimators.length || 1}
                          min={0}
                          value={votedCount}
                          gaugePrimaryColor={
                            votedCount === totalEstimators.length && totalEstimators.length > 0
                              ? '#10b981'
                              : '#d40d65'
                          }
                          gaugeSecondaryColor="rgba(156, 163, 175, 0.35)"
                          className="size-32 sm:size-34"
                        >
                          <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none">
                            {votedCount}/{totalEstimators.length}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold mt-0.5 uppercase tracking-wider">
                            {t('room.voted', 'đã chọn')}
                          </span>
                        </AnimatedCircularProgressBar>
                      </div>

                      {/* Right Ring: Server-Synchronized Countdown Timer */}
                      <div className="relative flex items-center justify-center">
                        <AnimatedCircularProgressBar
                          max={timerState.durationSeconds || 1}
                          min={0}
                          value={timerState.remainingSeconds}
                          gaugePrimaryColor={timerState.gaugeColor}
                          gaugeSecondaryColor="rgba(156, 163, 175, 0.35)"
                          className="size-32 sm:size-34 transition-all duration-300"
                        >
                          <span
                            className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${
                              timerState.colorPhase === 'urgent' || timerState.status === 'expired'
                                ? 'text-red-500'
                                : timerState.colorPhase === 'warning'
                                  ? 'text-amber-500'
                                  : 'text-foreground'
                            }`}
                          >
                            {timerState.formattedTime}
                          </span>
                          <span
                            className={`text-[10px] font-bold mt-0.5 uppercase tracking-wider ${
                              timerState.status === 'expired'
                                ? 'text-red-500 font-extrabold'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {timerState.status === 'expired'
                              ? t('room.timerExpired', 'Hết giờ!')
                              : timerState.status === 'paused'
                                ? t('room.timerPaused', 'Tạm dừng')
                                : t('room.remainingTime', 'còn lại')}
                          </span>
                        </AnimatedCircularProgressBar>

                        {/* Audio Mute Toggle Button */}
                        <button
                          type="button"
                          onClick={timerState.toggleMute}
                          title={
                            timerState.isMuted
                              ? t('room.soundMuted', 'Bật chuông')
                              : t('room.soundUnmuted', 'Tắt chuông')
                          }
                          className="absolute -top-1 -right-1 size-7 rounded-full bg-card/90 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shadow-xs border border-border/70 transition-colors cursor-pointer z-20"
                        >
                          {timerState.isMuted ? (
                            <VolumeX className="size-3.5 text-muted-foreground" />
                          ) : (
                            <Volume2 className="size-3.5 text-foreground" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Topic name */}
                  <div className="space-y-1.5 max-w-[500px]">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground line-clamp-2 leading-relaxed">
                      {currentRound.topic || t('room.defaultTopic', 'Ước lượng Task')}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-normal">
                      {votedCount === totalEstimators.length && totalEstimators.length > 0
                        ? t('room.allVoted', 'Tất cả đã chọn xong bài! Có thể lật bài.')
                        : t('room.waitingVotes', 'Chọn một lá bài từ thanh bên dưới')}
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* ── REVEALED STATE: Stats + Grouped Cards ── */
                <motion.div
                  key="revealed-state"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="w-full flex flex-col items-center space-y-4 py-2"
                >
                  {/* Statistics Row */}
                  <div className="grid grid-cols-3 gap-3 w-full max-w-[440px]">
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex flex-col items-center backdrop-blur-sm shadow-xs">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t('room.average', 'Trung bình')}
                      </span>
                      <span className="text-2xl font-extrabold text-primary mt-0.5">
                        {stats?.average !== null && stats?.average !== undefined
                          ? stats.average.toFixed(1)
                          : '—'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex flex-col items-center justify-center backdrop-blur-sm shadow-xs">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t('room.consensus', 'Đồng thuận')}
                      </span>
                      <div className="mt-1 flex items-center gap-1">
                        {stats?.consensus ? (
                          <Badge className="bg-emerald-500 text-white text-xs px-2.5 py-0.5 rounded-md gap-1 font-semibold">
                            <CheckCircle2 className="size-3.5" /> {t('room.highConsensus', 'Đạt')}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs px-2.5 py-0.5 rounded-md font-medium"
                          >
                            {stats?.agreementScore ? `${stats.agreementScore}%` : 'Chênh lệch'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex flex-col items-center backdrop-blur-sm shadow-xs">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t('room.totalVoters', 'Số phiếu')}
                      </span>
                      <span className="text-2xl font-extrabold text-foreground mt-0.5">
                        {votedCount}
                      </span>
                    </div>
                  </div>

                  {/* Grouped card stacks */}
                  {stats?.distribution && <RevealedCardStacks distribution={stats.distribution} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
});
