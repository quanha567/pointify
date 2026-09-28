import { memo } from 'react';
import { cn } from '@/lib/utils';

interface OneTechCardBackProps {
  className?: string;
}

const MAGENTA_CARD_BACK = '/images/cards/one-card-back-magenta.jpg';

export const OneTechCardBack = memo(function OneTechCardBack({
  className = '',
}: OneTechCardBackProps) {
  return (
    <div
      className={cn(
        'relative w-full h-full rounded-xl overflow-hidden select-none bg-brand-primary shadow-sm border border-brand-primary/40',
        className,
      )}
    >
      {/* High-res Luxury Symmetrical Magenta Artwork (Geometric Medallion, Seigaiha Waves, Sakura Branches) */}
      <img
        src={MAGENTA_CARD_BACK}
        alt="ONE Tech Card Back"
        className="absolute inset-0 size-full object-cover object-center pointer-events-none select-none"
        loading="lazy"
      />

      {/* Tactile Ambient Reflection Gloss */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
    </div>
  );
});
