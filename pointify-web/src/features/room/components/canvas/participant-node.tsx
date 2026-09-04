import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Check } from 'lucide-react';
import type { ParticipantProjection } from '../../types/room.types';
import { ThinkingMascot } from './mascots/thinking-mascot';
import { OneTechCardBack } from '../cards/one-tech-card-back';
import { PokerStoryCardFront } from '../cards/poker-story-card-front';

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
          {hasEstimated && !isRevealed ? (
            /* Card chosen — face-down One Tech Stop card with 3D spring flip in */
            <motion.div
              key="face-down"
              initial={{ scale: 0.3, opacity: 0, rotateY: 90, y: 15 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: -90, y: -20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              className="w-16 h-24 sm:w-18 sm:h-26 preserve-3d z-10 cursor-default"
            >
              <OneTechCardBack />
            </motion.div>
          ) : hasEstimated && isRevealed ? (
            /* Card revealed — Poker story point card front with staggered 3D cascade flip */
            <motion.div
              key="face-up"
              initial={{ scale: 0.4, opacity: 0, y: -15, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateY: 0 }}
              transition={{
                type: 'spring',
                stiffness: 340,
                damping: 22,
                delay: flipDelay,
              }}
              className="w-16 h-24 sm:w-18 sm:h-26 preserve-3d z-10 cursor-default"
            >
              <PokerStoryCardFront value={participant.estimatedValue} />
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

      {/* Participant Profile Capsule — enhanced contrast & pedestal grounded */}
      <div
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full border shadow-xs transition-all ${
          isCurrentUser
            ? 'bg-primary/12 border-primary/40 text-foreground font-semibold shadow-sm ring-1 ring-primary/20'
            : 'bg-card/95 border-border/80 text-foreground backdrop-blur-md'
        }`}
      >
        <div className="relative">
          {participant.photoURL ? (
            <img
              src={participant.photoURL}
              alt={participant.displayName}
              className="size-5 rounded-full object-cover shrink-0 bg-background/50 ring-1 ring-border"
            />
          ) : (
            <div className="size-5 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center shrink-0">
              {participant.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-1.5 rounded-full ring-1 ring-card ${
              isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'
            }`}
          />
        </div>

        <div className="flex items-center gap-1 max-w-[110px]">
          <span className="text-xs truncate font-medium">
            {participant.displayName}
            {isCurrentUser && ' (Tôi)'}
          </span>
          {participant.isFacilitator && (
            <Crown className="size-3.5 text-amber-500 fill-amber-500/20 shrink-0" />
          )}
        </div>

        {/* Checkmark indicator when voted */}
        {hasEstimated && !isRevealed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
          </motion.div>
        )}
      </div>
    </div>
  );
});
