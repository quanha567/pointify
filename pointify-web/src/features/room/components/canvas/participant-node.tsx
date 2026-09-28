import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ParticipantProjection } from '../../types/room.types';
import { ThinkingMascot } from './mascots/thinking-mascot';
import { PokerStoryCard } from '../cards/poker-story-card';
import { EASE_OUT } from '@/lib/ease';

interface ParticipantNodeProps {
  data: {
    participant?: ParticipantProjection;
    roundStatus?: 'voting' | 'revealed' | 'completed';
    isCurrentUser?: boolean;
  };
}

export const ParticipantNode = memo(function ParticipantNode({ data }: ParticipantNodeProps) {
  const { participant, roundStatus, isCurrentUser } = data;

  if (!participant) return null;

  const isRevealed = roundStatus === 'revealed' || roundStatus === 'completed';
  const hasEstimated = participant.hasEstimated;
  const isOnline = participant.isOnline ?? true;

  // Compute a slight deterministic stagger cascade delay for 3D flip animation
  const flipDelay = useMemo(() => {
    const sum = participant.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (sum % 6) * 0.05;
  }, [participant.id]);

  return (
    <div
      className={`flex flex-col items-center gap-2 select-none transition-opacity duration-200 ${
        isOnline ? 'opacity-100' : 'opacity-65'
      }`}
    >
      {/* Dynamic Slot: Thinking Mascot (before vote) -> Face-down Card -> Face-up Card */}
      <div className="perspective-1000 w-16 h-24 sm:w-18 sm:h-27 md:w-20 md:h-30 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {hasEstimated ? (
            /* Card chosen — true 3D flip between face-down and revealed face-up */
            <motion.div
              key="chosen-card"
              initial={{ scale: 0.8, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className="z-10 cursor-default"
            >
              <PokerStoryCard
                side={isRevealed ? 'front' : 'back'}
                value={participant.estimatedValue}
                size="md"
                flipDelay={isRevealed ? flipDelay : 0}
                enableTilt={false}
              />
            </motion.div>
          ) : (
            /* Thinking Mascot — contemplating before voting */
            <motion.div
              key="mascot-thinking"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                scale: 1.1,
                y: -8,
                opacity: 0,
                transition: { duration: 0.15, ease: 'easeIn' },
              }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className="w-full h-full flex items-center justify-center z-10"
            >
              <ThinkingMascot
                participantId={participant.id}
                isOnline={isOnline}
                photoURL={participant.photoURL}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Participant Name Badge — ONE Industrial 6px radius, status dot indicator */}
      <div
        className={`px-2.5 py-1 rounded-md border shadow-2xs transition-all duration-200 pointer-events-auto select-none max-w-[140px] flex items-center gap-1.5 text-center ${
          isCurrentUser
            ? 'bg-primary/10 border-primary/40 text-primary font-semibold ring-1 ring-primary/20'
            : 'bg-card/95 border-border text-foreground font-medium'
        }`}
      >
        {/* Live Status Indicator Dot */}
        <span
          className={`size-1.5 rounded-full shrink-0 ${
            !isOnline
              ? 'bg-slate-400'
              : hasEstimated
                ? 'bg-emerald-600'
                : 'bg-amber-500 animate-pulse'
          }`}
          aria-hidden
        />
        <span className="text-xs truncate block" title={participant.displayName}>
          {participant.displayName}
        </span>
      </div>
    </div>
  );
});
