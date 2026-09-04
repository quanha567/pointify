import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Eye, RotateCcw, Play, Pause, Sparkles, Loader2, Clock, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { CardValue, RoundTimerProjection } from '../../types/room.types';
import { PokerStoryCardFront } from '../cards/poker-story-card-front';
import { useRoundTimer } from '../../hooks/use-round-timer';

interface RoomDeckDockProps {
  cards: CardValue[];
  selectedCard?: CardValue | null;
  onSelectCard?: (card: CardValue) => void;
  disabled?: boolean;
  // Facilitator integrated controls
  isFacilitator?: boolean;
  isRoundRevealed?: boolean;
  onReveal?: () => void;
  onNewRound?: () => void;
  onReset?: () => void;
  isActionLoading?: boolean;
  isSpectator?: boolean;
  // Timer controls
  timer?: RoundTimerProjection | null;
  onStartTimer?: (durationSeconds: number) => void;
  onPauseTimer?: () => void;
  onResumeTimer?: () => void;
  onStopTimer?: () => void;
  onAddTimerSeconds?: (seconds?: number) => void;
}

export function RoomDeckDock({
  cards,
  selectedCard,
  onSelectCard,
  disabled = false,
  isFacilitator = false,
  isRoundRevealed = false,
  onReveal,
  onNewRound,
  onReset,
  isActionLoading = false,
  isSpectator = false,
  timer,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  onAddTimerSeconds,
}: RoomDeckDockProps) {
  const { t } = useTranslation();
  const [isTimerPopoverOpen, setIsTimerPopoverOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30); // 30s default

  const timerState = useRoundTimer(timer, isRoundRevealed);
  const isTimerActive = timerState.isActive && timerState.status !== 'expired';

  // Automatically clean up expired timer on backend after 4 seconds
  useEffect(() => {
    if (isFacilitator && timerState.status === 'expired' && onStopTimer) {
      const timeout = setTimeout(() => {
        onStopTimer();
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [isFacilitator, timerState.status, onStopTimer]);

  // If spectator and not facilitator, hide the dock entirely
  if (isSpectator && !isFacilitator) return null;

  return (
    <div className="absolute bottom-4 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
      <div className="pointer-events-auto max-w-5xl w-full bg-card/95 backdrop-blur-2xl border border-border/70 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-border/40">
        {/* ── Top Attached Facilitator Control Strip ───────────── */}
        {isFacilitator && onReveal && onNewRound && onReset && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/25">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>{t('room.facilitatorTitle', 'Điều phối phòng')}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* ── Timer Controls (Only during voting phase) ────────── */}
              {!isRoundRevealed && (
                <>
                  {!isTimerActive ? (
                    <Popover open={isTimerPopoverOpen} onOpenChange={setIsTimerPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full gap-1.5 text-xs font-medium h-7.5 px-3 border-border/70 hover:bg-muted/70 cursor-pointer"
                        >
                          <Clock className="size-3.5 text-primary" />
                          <span>{t('room.timer', 'Hẹn giờ')}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        side="top"
                        sideOffset={10}
                        className="w-72 p-4 space-y-3.5 rounded-2xl shadow-xl backdrop-blur-xl bg-card/98 border border-border/70 z-50"
                      >
                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                            <Clock className="size-3.5 text-primary" />
                            <span>{t('room.setTimerTitle', 'Hẹn giờ vòng ước lượng')}</span>
                          </div>
                          <span className="text-[11px] font-bold text-muted-foreground">
                            {Math.floor(selectedDuration / 60)}:
                            {String(selectedDuration % 60).padStart(2, '0')}
                          </span>
                        </div>

                        {/* Preset Chips */}
                        <div className="grid grid-cols-5 gap-1.5">
                          {[
                            { label: '30s', sec: 30 },
                            { label: '1m', sec: 60 },
                            { label: '2m', sec: 120 },
                            { label: '3m', sec: 180 },
                            { label: '5m', sec: 300 },
                          ].map((preset) => (
                            <button
                              key={preset.sec}
                              type="button"
                              onClick={() => setSelectedDuration(preset.sec)}
                              className={`h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                selectedDuration === preset.sec
                                  ? 'bg-primary text-primary-foreground shadow-xs scale-102'
                                  : 'bg-muted/60 hover:bg-muted text-foreground'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>

                        {/* Start Button */}
                        <Button
                          size="sm"
                          onClick={() => {
                            onStartTimer?.(selectedDuration);
                            setIsTimerPopoverOpen(false);
                          }}
                          className="w-full rounded-full font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 cursor-pointer h-8 gap-1.5"
                        >
                          <Play className="size-3 fill-current" />
                          <span>
                            {t('room.startTimer', 'Bắt đầu')} ({Math.floor(selectedDuration / 60)}:
                            {String(selectedDuration % 60).padStart(2, '0')})
                          </span>
                        </Button>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    /* Active Timer Cohesive Segmented Group (h-7.5 aligned with action buttons) */
                    <div className="h-7.5 inline-flex items-center rounded-full bg-background border border-border/70 px-1 gap-1 shadow-2xs">
                      {/* Time Readout */}
                      <div
                        className={`inline-flex items-center gap-1 px-1.5 font-mono text-xs font-bold ${
                          timerState.colorPhase === 'urgent' || timerState.status === 'expired'
                            ? 'text-red-500'
                            : timerState.colorPhase === 'warning'
                              ? 'text-amber-500'
                              : 'text-foreground'
                        }`}
                      >
                        <Clock className="size-3.5 shrink-0" />
                        <span>{timerState.formattedTime}</span>
                      </div>

                      {/* Divider */}
                      <div className="h-3.5 w-px bg-border/70" />

                      {/* Pause / Resume Button */}
                      {timerState.status === 'paused' ? (
                        <button
                          type="button"
                          onClick={onResumeTimer}
                          title={t('room.resumeTimer', 'Tiếp tục')}
                          className="size-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Play className="size-3 fill-current ml-0.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onPauseTimer}
                          title={t('room.pauseTimer', 'Tạm dừng')}
                          className="size-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Pause className="size-3 fill-current" />
                        </button>
                      )}

                      {/* +30s Extension Button */}
                      <button
                        type="button"
                        onClick={() => onAddTimerSeconds?.(30)}
                        title={t('room.add30s', '+30s')}
                        className="h-6 px-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                      >
                        <Plus className="size-2.5" />
                        <span>30s</span>
                      </button>

                      {/* Cancel / Stop Button */}
                      <button
                        type="button"
                        onClick={onStopTimer}
                        title={t('room.stopTimer', 'Hủy')}
                        className="size-6 rounded-full hover:bg-destructive/15 text-muted-foreground hover:text-destructive flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Reveal / Next Round Button */}
              {!isRoundRevealed ? (
                <Button
                  onClick={onReveal}
                  disabled={isActionLoading}
                  size="sm"
                  className="rounded-full gap-1.5 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 cursor-pointer h-7.5 px-3.5"
                >
                  {isActionLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                  <span>{t('room.revealCards', 'Lật bài ngay')}</span>
                </Button>
              ) : (
                <Button
                  onClick={onNewRound}
                  disabled={isActionLoading}
                  size="sm"
                  className="rounded-full gap-1.5 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 cursor-pointer h-7.5 px-3.5"
                >
                  {isActionLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Play className="size-3.5" />
                  )}
                  <span>{t('room.nextRound', 'Vòng tiếp theo')}</span>
                </Button>
              )}

              <Button
                onClick={onReset}
                disabled={isActionLoading}
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5 text-xs font-medium h-7.5 px-3 border-border/70 hover:bg-muted/70 cursor-pointer"
              >
                <RotateCcw className={`size-3.5 ${isActionLoading ? 'animate-spin' : ''}`} />
                <span>{t('room.resetRound', 'Bỏ phiếu lại')}</span>
              </Button>
            </div>
          </div>
        )}

        {/* ── Physical Poker Story Card Strip (Hidden for Spectators) ───── */}
        {!isSpectator && onSelectCard && (
          <div className="flex items-end justify-start xl:justify-center gap-2 sm:gap-2.5 px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-3.5 overflow-x-auto scrollbar-none scroll-smooth">
            {cards.map((card) => {
              const isSelected = selectedCard === card;

              return (
                <motion.button
                  key={String(card)}
                  disabled={disabled}
                  whileHover={disabled ? {} : { y: -8, scale: 1.05 }}
                  whileTap={disabled ? {} : { scale: 0.95 }}
                  onClick={() => onSelectCard(card)}
                  className={`relative w-16 h-24 sm:w-17 sm:h-25.5 md:w-18 md:h-27 rounded-xl sm:rounded-2xl shrink-0 transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? '-translate-y-3 scale-105 ring-2 ring-[#d40d65] shadow-xl shadow-pink-500/25'
                      : 'hover:shadow-md opacity-95 hover:opacity-100'
                  } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <PokerStoryCardFront value={card} />

                  {/* Selected indicator dot */}
                  {isSelected && (
                    <motion.span
                      layoutId="selectedCardDot"
                      className="absolute -bottom-2 inset-x-0 mx-auto size-2 rounded-full bg-[#d40d65] ring-2 ring-card shadow-md"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
