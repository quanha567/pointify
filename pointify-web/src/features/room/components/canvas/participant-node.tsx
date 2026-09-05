import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ParticipantProjection } from '../../types/room.types';
import { ThinkingMascot } from './mascots/thinking-mascot';
import { PokerStoryCard } from '../cards/poker-story-card';

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
    return (sum % 6) * 0.06;
  }, [participant.id]);

  return (
    <div
      className={`flex flex-col items-center gap-2 select-none transition-all duration-300 ${
        isOnline ? 'opacity-100' : 'opacity-75'
      }`}
    >
      {/* Dynamic Slot: Thinking Mascot (before vote) -> Face-down Card -> Face-up Card */}
      <div className="perspective-1000 w-16 h-24 sm:w-18 sm:h-26 flex items-center justify-center relative">
        {/* Seat Pedestal Glow beneath mascot / card */}
        <div className="absolute -bottom-1.5 w-16 sm:w-20 h-4 rounded-full bg-primary/20 blur-[4px] pointer-events-none ring-1 ring-primary/10" />

        <AnimatePresence mode="wait">
          {hasEstimated ? (
            /* Card chosen — true 3D flip between face-down and revealed face-up */
            <motion.div
              key="chosen-card"
              initial={{ scale: 0.3, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              className="z-10 cursor-default"
            >
              <PokerStoryCard
                side={isRevealed ? 'front' : 'back'}
                value={participant.estimatedValue}
                size="md"
                flipDelay={isRevealed ? flipDelay : 0}
              />
            </motion.div>
          ) : (
            /* Thinking Mascot — contemplating before voting */
            <motion.div
              key="mascot-thinking"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                scale: 1.25,
                y: -12,
                opacity: 0,
                transition: { duration: 0.22, ease: 'easeIn' },
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
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

      {/* Participant Name Badge — simplified to display name only, active color for current user */}
      <div
        className={`px-3 py-1 rounded-full border shadow-xs transition-all duration-300 pointer-events-auto select-none max-w-[130px] text-center ${
          isCurrentUser
            ? 'bg-primary/15 border-primary/50 text-primary font-semibold shadow-sm ring-1 ring-primary/25'
            : 'bg-card/90 border-border/80 text-foreground/85 backdrop-blur-md font-medium'
        }`}
      >
        <span className="text-xs truncate block" title={participant.displayName}>
          {participant.displayName}
        </span>
      </div>
    </div>
  );
});
