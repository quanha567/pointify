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
        'relative w-full h-full rounded-xl overflow-hidden select-none transition-all duration-150',
        selected
          ? 'border-2 border-[#E31C79] shadow-md shadow-[#E31C79]/20 ring-1 ring-inset ring-[#E31C79]/30'
          : 'border border-border/70 shadow-sm',
        isSpecialMagenta ? 'bg-[#E31C79] text-white' : 'bg-white text-[#0B1B3D]',
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

      {/* Selected Indicator Badge (Anchored cleanly inside the top-right corner to avoid overflow clipping) */}
      {selected && (
        <div
          aria-label="Selected"
          className="absolute top-2 right-2 z-20 flex size-5 items-center justify-center rounded-full bg-[#E31C79] text-white shadow-md ring-2 ring-white/95 pointer-events-none animate-in fade-in zoom-in-75 duration-150"
        >
          <Check className="size-3 stroke-[3]" />
        </div>
      )}

      {/* Center Section: Prominent Story Point Value */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pb-2 sm:pb-3">
        <span
          className={cn(
            'font-black tracking-tight leading-none select-none drop-shadow-xs',
            isSpecialMagenta ? 'text-white' : 'text-[#0B1B3D]',
            isLg ? 'text-5xl sm:text-6xl' : isSm ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl',
          )}
          style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
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
