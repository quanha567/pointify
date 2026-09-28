import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';
import { useRoundTimer } from '../../hooks/use-round-timer';
import { EASE_OUT } from '@/lib/ease';
import type { RoundTimerProjection } from '../../types/room.types';

interface ArenaActiveTimerProps {
  timer?: RoundTimerProjection | null;
  isRevealed: boolean;
  totalEstimators: number;
  votedCount: number;
}

export const ArenaActiveTimer = memo(function ArenaActiveTimer({
  timer,
  isRevealed,
  totalEstimators,
  votedCount,
}: ArenaActiveTimerProps) {
  const { t } = useTranslation('room');
  const timerState = useRoundTimer(timer, isRevealed);

  if (!timerState.isActive) {
    return (
      <motion.div
        layout
        transition={{ duration: 0.15, ease: EASE_OUT }}
        className="relative flex items-center justify-center"
      >
        <AnimatedCircularProgressBar
          max={totalEstimators || 1}
          min={0}
          value={votedCount}
          gaugePrimaryColor={
            votedCount === totalEstimators && totalEstimators > 0
              ? 'var(--color-semantic-success)'
              : 'var(--color-brand-primary)'
          }
          gaugeSecondaryColor="rgba(148, 163, 184, 0.25)"
          className="size-32"
        >
          <span className="text-3xl font-mono font-bold text-foreground tracking-tight leading-none">
            {votedCount}/{totalEstimators}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground font-medium mt-1 uppercase tracking-wider">
            {t('room.voted')}
          </span>
        </AnimatedCircularProgressBar>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      transition={{ duration: 0.15, ease: EASE_OUT }}
      className="flex items-center justify-center gap-8"
    >
      {/* Left Ring: Estimation Progress */}
      <div className="relative flex items-center justify-center">
        <AnimatedCircularProgressBar
          max={totalEstimators || 1}
          min={0}
          value={votedCount}
          gaugePrimaryColor={
            votedCount === totalEstimators && totalEstimators > 0
              ? 'var(--color-semantic-success)'
              : 'var(--color-brand-primary)'
          }
          gaugeSecondaryColor="rgba(148, 163, 184, 0.25)"
          className="size-28"
        >
          <span className="text-2xl font-mono font-bold text-foreground tracking-tight leading-none">
            {votedCount}/{totalEstimators}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground font-medium mt-0.5 uppercase tracking-wider">
            {t('room.voted')}
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
          gaugeSecondaryColor="rgba(148, 163, 184, 0.25)"
          className="size-28 transition-all duration-200"
        >
          <span
            className={`text-2xl font-mono font-bold tracking-tight leading-none ${
              timerState.colorPhase === 'urgent' || timerState.status === 'expired'
                ? 'text-red-600'
                : timerState.colorPhase === 'warning'
                  ? 'text-amber-600'
                  : 'text-foreground'
            }`}
          >
            {timerState.formattedTime}
          </span>
          <span
            className={`text-[11px] font-mono font-medium mt-0.5 uppercase tracking-wider ${
              timerState.status === 'expired' ? 'text-red-600 font-bold' : 'text-muted-foreground'
            }`}
          >
            {timerState.status === 'expired'
              ? t('room.timerExpired')
              : timerState.status === 'paused'
                ? t('room.timerPaused')
                : t('room.remainingTime')}
          </span>
        </AnimatedCircularProgressBar>
      </div>
    </motion.div>
  );
});
