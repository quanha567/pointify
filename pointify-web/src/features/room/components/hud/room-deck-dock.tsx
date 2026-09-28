import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Loader2,
  Clock,
  Plus,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { CardValue, RoundTimerProjection } from '../../types/room.types';
import { PokerStoryCardFront } from '../cards/poker-story-card-front';
import { OneTechCardBack } from '../cards/one-tech-card-back';
import { ProjectFolder, type ProjectFolderPreview } from '@/components/motion/project-folder';
import { useRoundTimer } from '../../hooks/use-round-timer';
import { useActiveRoom } from '../../hooks/use-active-room';
import { useRoomStore } from '../../context/room-store-context';
import { cn } from '@/lib/utils';

export interface RoomDeckDockProps {
  cards?: CardValue[];
  selectedCard?: CardValue | null;
  onSelectCard?: (card: CardValue) => void;
  disabled?: boolean;
  roundId?: string | number;
  deckType?: string;
  // Facilitator integrated controls
  isFacilitator?: boolean;
  isRoundRevealed?: boolean;
  onReveal?: () => void;
  onNewRound?: () => void;
  onReset?: () => void;
  isActionLoading?: boolean;
  isSpectator?: boolean;
  // Jira sync controls
  onSyncJiraPoints?: () => void;
  isSyncingJira?: boolean;
  hasJiraStory?: boolean;
  // Timer controls
  timer?: RoundTimerProjection | null;
  onStartTimer?: (durationSeconds: number) => void;
  onPauseTimer?: () => void;
  onResumeTimer?: () => void;
  onStopTimer?: () => void;
  onAddTimerSeconds?: (seconds?: number) => void;
}

export function RoomDeckDock(props: RoomDeckDockProps = {}) {
  const { t } = useTranslation('room');
  const active = useActiveRoom();
  const room = active.room;

  const cards: CardValue[] = props.cards || (active.activeDeckConfig.cards as CardValue[]);
  const selectedCard = props.selectedCard !== undefined ? props.selectedCard : active.selectedCard;

  // Optimistic local selection state for instant 0ms visual feedback
  const [optimisticSelectedCard, setOptimisticSelectedCard] = useState<
    CardValue | null | undefined
  >(undefined);

  useEffect(() => {
    setOptimisticSelectedCard(undefined);
  }, [selectedCard]);

  const effectiveSelectedCard =
    optimisticSelectedCard !== undefined ? optimisticSelectedCard : selectedCard;

  const isFacilitator =
    props.isFacilitator !== undefined ? props.isFacilitator : active.isFacilitator;
  const isRoundRevealed =
    props.isRoundRevealed !== undefined ? props.isRoundRevealed : active.isRoundRevealed;
  const isSpectator = props.isSpectator !== undefined ? props.isSpectator : active.isSpectator;
  const hasJiraStory = props.hasJiraStory !== undefined ? props.hasJiraStory : active.hasJiraStory;
  const timer = props.timer !== undefined ? props.timer : room?.currentRound.timer;
  const disabled = props.disabled !== undefined ? props.disabled : isRoundRevealed;

  const submitEstimate = useRoomStore((s) => s.submitEstimate);
  const onSelectCard =
    props.onSelectCard ||
    ((card: CardValue) => {
      const isSame =
        effectiveSelectedCard !== null &&
        effectiveSelectedCard !== undefined &&
        String(effectiveSelectedCard) === String(card);
      submitEstimate(isSame ? null : card);
    });

  const revealCards = useRoomStore((s) => s.revealCards);
  const onReveal = props.onReveal || revealCards;

  const nextRound = useRoomStore((s) => s.nextRound);
  const onNewRound = props.onNewRound || (() => nextRound());

  const resetRound = useRoomStore((s) => s.resetRound);
  const onReset = props.onReset || resetRound;

  const startTimer = useRoomStore((s) => s.startTimer);
  const onStartTimer = props.onStartTimer || startTimer;

  const pauseTimer = useRoomStore((s) => s.pauseTimer);
  const onPauseTimer = props.onPauseTimer || pauseTimer;

  const resumeTimer = useRoomStore((s) => s.resumeTimer);
  const onResumeTimer = props.onResumeTimer || resumeTimer;

  const stopTimer = useRoomStore((s) => s.stopTimer);
  const onStopTimer = props.onStopTimer || stopTimer;

  const addTimerSeconds = useRoomStore((s) => s.addTimerSeconds);
  const onAddTimerSeconds = props.onAddTimerSeconds || addTimerSeconds;

  const isActionLoading =
    props.isActionLoading !== undefined
      ? props.isActionLoading
      : useRoomStore((s) => s.isActionLoading);

  const onSyncJiraPoints = props.onSyncJiraPoints;
  const isSyncingJira = props.isSyncingJira || false;

  const [isFolderExpanded, setIsFolderExpanded] = useState(false);
  const [isTimerPopoverOpen, setIsTimerPopoverOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);

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

  const handleSelectFromFolder = (card: CardValue) => {
    if (disabled) return;
    const isSameCard =
      effectiveSelectedCard !== null &&
      effectiveSelectedCard !== undefined &&
      String(effectiveSelectedCard) === String(card);
    const nextVal = isSameCard ? null : card;
    setOptimisticSelectedCard(nextVal);
    onSelectCard(card);
  };

  // 5 face-down cards for the 3D fan preview (Estimate Secrecy compliant, shared-layout flight matching)
  const previewCards: ProjectFolderPreview[] = useMemo(() => {
    // Pick 5 cards centered around selectedCard if selected, or first 5 cards
    let fanCards = cards.slice(0, 5);
    const isAnySelected = effectiveSelectedCard !== null && effectiveSelectedCard !== undefined;

    if (isAnySelected) {
      const selectedIndex = cards.findIndex((c) => String(c) === String(effectiveSelectedCard));
      if (selectedIndex !== -1) {
        const start = Math.max(0, Math.min(cards.length - 5, selectedIndex - 2));
        fanCards = cards.slice(start, start + 5);
      }
    }

    return fanCards.map((c, index) => {
      const isCardSelected = isAnySelected && String(effectiveSelectedCard) === String(c);
      const isCenterFallback =
        isAnySelected &&
        !fanCards.some((fc) => String(fc) === String(effectiveSelectedCard)) &&
        index === 2;
      const highlightSelected = isCardSelected || isCenterFallback;

      return {
        id: String(c),
        selected: highlightSelected,
        content: (
          <div
            className={cn(
              'size-full flex items-center justify-center',
              highlightSelected && 'ring-2 ring-brand-primary -translate-y-1',
            )}
          >
            <OneTechCardBack className="size-full" />
          </div>
        ),
      };
    });
  }, [cards, effectiveSelectedCard]);

  // Full interactive grid for expanded overlay (All cards from active deck)
  const folderGridItems: ProjectFolderPreview[] = useMemo(() => {
    return cards.map((c) => {
      const isSelected =
        effectiveSelectedCard !== null &&
        effectiveSelectedCard !== undefined &&
        String(effectiveSelectedCard) === String(c);
      return {
        id: String(c),
        selected: isSelected,
        content: (
          <div className="relative size-full flex items-center justify-center select-none">
            <PokerStoryCardFront
              value={c}
              size="md"
              compact
              selected={isSelected}
              enableTilt={false}
              className="size-full"
            />
          </div>
        ),
        onClick: () => handleSelectFromFolder(c),
      };
    });
  }, [cards, effectiveSelectedCard, disabled]);

  const deckTitle = t(`decks.${active.activeDeckConfig?.translationKey}.name`, 'ONE Tech Deck');
  const statusDescription =
    effectiveSelectedCard !== null && effectiveSelectedCard !== undefined
      ? t('room.cardSelected', 'Đã chọn bài')
      : t('room.cardNotSelected', 'Chưa chọn bài');
  const statusHeader =
    effectiveSelectedCard !== null && effectiveSelectedCard !== undefined
      ? String(effectiveSelectedCard) === '1'
        ? t('room.selectedPointStatusSingular', {
            value: String(effectiveSelectedCard),
            defaultValue: `Selected: ${effectiveSelectedCard} point`,
          })
        : t('room.selectedPointStatus', { value: String(effectiveSelectedCard) })
      : undefined;

  // If spectator and not facilitator, hide the dock entirely
  if (isSpectator && !isFacilitator) return null;

  return (
    <div className="absolute bottom-4 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
      <div className="pointer-events-auto max-w-5xl w-full rounded-xl border border-border/80 bg-card/95 shadow-xl backdrop-blur-2xl transition-all duration-200">
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:px-4">
          {/* ── Left Section: ONE Container Deck Box ───── */}
          <div className="flex items-center gap-3">
            {!isSpectator && (
              <ProjectFolder
                title={deckTitle}
                description={statusDescription}
                itemLabel={t('room.cardLabel', 'lá')}
                statusText={statusHeader}
                size="sm"
                previews={previewCards}
                items={folderGridItems}
                expanded={isFolderExpanded}
                onExpandedChange={setIsFolderExpanded}
                disabled={disabled}
              />
            )}
          </div>

          {/* ── Center / Right Section: Timer & Facilitator Controls ───── */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* ── Timer Section ────────── */}
            {!isRoundRevealed && (
              <>
                {isFacilitator && !isTimerActive ? (
                  <Popover open={isTimerPopoverOpen} onOpenChange={setIsTimerPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg gap-1.5 text-xs font-medium h-9 px-3 border-border hover:bg-muted cursor-pointer"
                      >
                        <Clock className="size-3.5 text-brand-primary" />
                        <span>{t('room.timer')}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      side="top"
                      sideOffset={10}
                      className="w-72 p-4 space-y-3.5 rounded-xl shadow-xl backdrop-blur-xl bg-card border border-border z-50"
                    >
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                          <Clock className="size-3.5 text-brand-primary" />
                          <span>{t('room.setTimerTitle')}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-muted-foreground">
                          {Math.floor(selectedDuration / 60)}:
                          {String(selectedDuration % 60).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Preset Chips */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { label: '30s', val: 30 },
                          { label: '1m', val: 60 },
                          { label: '2m', val: 120 },
                          { label: '3m', val: 180 },
                          { label: '5m', val: 300 },
                        ].map(({ label, val }) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSelectedDuration(val)}
                            className={`py-1.5 text-xs font-mono font-bold rounded-md border transition-colors cursor-pointer ${
                              selectedDuration === val
                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                : 'bg-muted/40 border-border hover:bg-muted text-foreground'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Stepper buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDuration((prev) => Math.max(15, prev - 15))}
                          className="rounded-md h-7 px-2.5 text-xs font-mono cursor-pointer"
                        >
                          -15s
                        </Button>
                        <span className="text-xs text-muted-foreground font-medium">
                          {t('room.customDuration')}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDuration((prev) => prev + 15)}
                          className="rounded-md h-7 px-2.5 text-xs font-mono cursor-pointer"
                        >
                          +15s
                        </Button>
                      </div>

                      {/* Start Button */}
                      <Button
                        size="sm"
                        onClick={() => {
                          onStartTimer?.(selectedDuration);
                          setIsTimerPopoverOpen(false);
                        }}
                        className="w-full rounded-lg font-semibold text-xs bg-brand-primary text-white hover:bg-brand-hover shadow-xs cursor-pointer h-8 gap-1.5"
                      >
                        <Play className="size-3 fill-current" />
                        <span>
                          {t('room.startTimer')} ({Math.floor(selectedDuration / 60)}:
                          {String(selectedDuration % 60).padStart(2, '0')})
                        </span>
                      </Button>
                    </PopoverContent>
                  </Popover>
                ) : isTimerActive ? (
                  /* Active Timer Group */
                  <div className="h-9 inline-flex items-center rounded-lg bg-background/80 border border-border px-1.5 gap-1 shadow-2xs">
                    <div
                      className={`inline-flex items-center gap-1 px-1.5 font-mono text-xs font-bold ${
                        timerState.colorPhase === 'urgent' || timerState.status === 'expired'
                          ? 'text-red-600'
                          : timerState.colorPhase === 'warning'
                            ? 'text-amber-600'
                            : 'text-foreground'
                      }`}
                    >
                      <Clock className="size-3.5 shrink-0" />
                      <span>{timerState.formattedTime}</span>
                    </div>

                    {isFacilitator && (
                      <>
                        <div className="h-3.5 w-px bg-border" />
                        {timerState.status === 'paused' ? (
                          <button
                            type="button"
                            onClick={onResumeTimer}
                            title={t('room.resumeTimer')}
                            className="size-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Play className="size-3 fill-current ml-0.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={onPauseTimer}
                            title={t('room.pauseTimer')}
                            className="size-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Pause className="size-3 fill-current" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onAddTimerSeconds?.(30)}
                          title={t('room.add30s')}
                          className="h-6 px-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground font-mono text-xs font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                        >
                          <Plus className="size-3" />
                          <span>30s</span>
                        </button>

                        <button
                          type="button"
                          onClick={onStopTimer}
                          title={t('room.stopTimer')}
                          className="size-6 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </>
                    )}

                    {/* Mute Toggle */}
                    <button
                      type="button"
                      onClick={timerState.toggleMute}
                      title={timerState.isMuted ? t('room.soundMuted') : t('room.soundUnmuted')}
                      className="size-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                    >
                      {timerState.isMuted ? (
                        <VolumeX className="size-3.5 text-muted-foreground" />
                      ) : (
                        <Volume2 className="size-3.5 text-brand-primary" />
                      )}
                    </button>
                  </div>
                ) : null}
              </>
            )}

            {/* ── Facilitator Action Buttons ────────── */}
            {isFacilitator && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {!isRoundRevealed ? (
                  <Button
                    onClick={onReveal}
                    disabled={isActionLoading}
                    size="sm"
                    className="rounded-lg gap-1.5 font-semibold text-xs bg-brand-primary text-white hover:bg-brand-hover shadow-xs cursor-pointer h-9 px-3.5"
                  >
                    {isActionLoading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                    <span>{t('room.revealCards')}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={onNewRound}
                    disabled={isActionLoading}
                    size="sm"
                    className="rounded-lg gap-1.5 font-semibold text-xs bg-brand-primary text-white hover:bg-brand-hover shadow-xs cursor-pointer h-9 px-3.5"
                  >
                    {isActionLoading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Play className="size-3.5" />
                    )}
                    <span>{t('room.nextRound')}</span>
                  </Button>
                )}

                <Button
                  onClick={onReset}
                  disabled={isActionLoading}
                  variant="outline"
                  size="sm"
                  className="rounded-lg gap-1.5 text-xs font-medium h-9 px-3 border-border hover:bg-muted cursor-pointer"
                >
                  <RotateCcw className={`size-3.5 ${isActionLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{t('room.resetRound')}</span>
                </Button>

                {isRoundRevealed && hasJiraStory && onSyncJiraPoints && (
                  <Button
                    onClick={onSyncJiraPoints}
                    disabled={isActionLoading || isSyncingJira}
                    size="sm"
                    className="rounded-lg gap-1.5 font-semibold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer h-9 px-3.5"
                  >
                    {isSyncingJira ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                    <span>{t('jira.syncPointsBtn')}</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
