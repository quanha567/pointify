import { memo } from 'react';
import { Check } from 'lucide-react';
import type { CardValue } from '../../types/room.types';
import { TiltCard } from '@/components/motion/tilt-card';
import { cn } from '@/lib/utils';

interface PokerStoryCardFrontProps {
  value?: CardValue | null;
  className?: string;
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg';
  enableTilt?: boolean;
  selected?: boolean;
}

const LIGHT_CARD_BG = '/images/cards/one-card-bg-light.png';
const MAGENTA_CARD_BG = '/images/cards/one-card-bg-magenta.jpg';

export const PokerStoryCardFront = memo(function PokerStoryCardFront({
  value,
  className = '',
  compact = false,
  size = 'md',
  enableTilt = true,
  selected = false,
}: PokerStoryCardFrontProps) {
  const displayVal = String(value ?? '—');
  const isSpecialMagenta = displayVal === '?' || displayVal === '☕';

  const isLg = size === 'lg';
  const isSm = compact || size === 'sm';

  const bgImage = isSpecialMagenta ? MAGENTA_CARD_BG : LIGHT_CARD_BG;

  const cardContent = (
    <div
      className={cn(
        'relative w-full h-full rounded-xl overflow-hidden select-none transition-all duration-200',
        selected
          ? isSpecialMagenta
            ? 'border-2 border-white shadow-xl shadow-black/40'
            : 'border-2 border-brand-primary shadow-xl shadow-brand-primary/25'
          : 'border border-border/70 shadow-sm hover:border-slate-400 dark:hover:border-slate-500',
        isSpecialMagenta ? 'bg-brand-primary text-white' : 'bg-white text-brand-navy',
        className,
      )}
    >
      {/* High-res Art Background (Seigaiha Waves, Floating Petals, ONE Vessel, Official Logo) */}
      <img
        src={bgImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover object-center pointer-events-none select-none"
        loading="lazy"
      />

      {/* Selected Indicator Badge (Anchored cleanly inside the top-right corner) */}
      {selected && (
        <div
          aria-label="Selected"
          className={cn(
            'absolute top-2.5 right-2.5 z-20 flex size-5.5 items-center justify-center rounded-full shadow-md pointer-events-none animate-in fade-in zoom-in-75 duration-150',
            isSpecialMagenta
              ? 'bg-white text-brand-primary'
              : 'bg-brand-primary text-white ring-2 ring-white',
          )}
        >
          <Check className="size-3.5 stroke-[3]" />
        </div>
      )}

      {/* Center Section: Prominent Story Point Value */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pb-2 sm:pb-3">
        <span
          className={cn(
            'font-sans font-black tracking-tight leading-none select-none drop-shadow-xs transition-transform duration-150',
            selected && 'scale-105',
            isSpecialMagenta ? 'text-white' : 'text-brand-navy',
            isLg ? 'text-5xl sm:text-6xl' : isSm ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl',
          )}
        >
          {displayVal}
        </span>
      </div>
    </div>
  );

  if (!enableTilt) {
    return cardContent;
  }

  return (
    <TiltCard max={8} glare={true} className="w-full h-full rounded-xl">
      {cardContent}
    </TiltCard>
  );
});
