import { memo } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { CardValue } from '../../types/room.types';
import { PokerStoryCardFront } from './poker-story-card-front';
import { OneTechCardBack } from './one-tech-card-back';

export type CardSize = 'sm' | 'md' | 'lg';
export type CardSide = 'front' | 'back';

export interface PokerStoryCardProps {
  value?: CardValue | null;
  side?: CardSide;
  size?: CardSize;
  className?: string;
  flipDelay?: number;
  compact?: boolean;
}

const SIZE_CLASSES: Record<CardSize, string> = {
  sm: 'w-14 h-21',
  md: 'w-16 h-24 sm:w-17 sm:h-25.5 md:w-18 md:h-27',
  lg: 'w-20 h-30 sm:w-24 sm:h-36',
};

export const PokerStoryCard = memo(function PokerStoryCard({
  value,
  side = 'front',
  size = 'md',
  className = '',
  flipDelay = 0,
  compact = false,
}: PokerStoryCardProps) {
  const isBack = side === 'back';

  return (
    <div
      className={cn(
        'relative perspective-1000 select-none aspect-[2/3]',
        SIZE_CLASSES[size],
        className,
      )}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isBack ? 180 : 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 24,
          delay: flipDelay,
        }}
      >
        {/* Front Face (Story Point Front) */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <PokerStoryCardFront value={value} size={size} compact={compact || size === 'sm'} />
        </div>

        {/* Back Face (One Tech Stop Logo & Ribbed Texture) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <OneTechCardBack />
        </div>
      </motion.div>
    </div>
  );
});
