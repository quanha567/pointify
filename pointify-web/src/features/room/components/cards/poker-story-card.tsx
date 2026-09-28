import { memo } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/ease';
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
  enableTilt?: boolean;
}

const SIZE_CLASSES: Record<CardSize, string> = {
  sm: 'w-14 h-21',
  md: 'w-[72px] h-[108px] sm:w-[78px] sm:h-[117px] md:w-[82px] md:h-[123px]',
  lg: 'w-24 h-36 sm:w-28 sm:h-42',
};

export const PokerStoryCard = memo(function PokerStoryCard({
  value,
  side = 'front',
  size = 'md',
  className = '',
  flipDelay = 0,
  compact = false,
  enableTilt = true,
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
          duration: 0.2,
          ease: EASE_OUT,
          delay: flipDelay,
        }}
      >
        {/* Front Face (Story Point Front) */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <PokerStoryCardFront
            value={value}
            size={size}
            compact={compact || size === 'sm'}
            enableTilt={enableTilt && !isBack}
          />
        </div>

        {/* Back Face (One Tech Stop Logo & Ribbed Texture) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <OneTechCardBack />
        </div>
      </motion.div>
    </div>
  );
});
