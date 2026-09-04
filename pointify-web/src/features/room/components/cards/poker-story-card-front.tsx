import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CardValue } from '../../types/room.types';
import { getCardVisualMeta } from '../../constants/card-metadata';
import { ContainerStackVisual } from './container-stack-visual';

interface PokerStoryCardFrontProps {
  value?: CardValue | null;
  className?: string;
  compact?: boolean;
}

export const PokerStoryCardFront = memo(function PokerStoryCardFront({
  value,
  className = '',
  compact = false,
}: PokerStoryCardFrontProps) {
  const { t } = useTranslation();
  const meta = getCardVisualMeta(value);
  const displayVal = String(value ?? '—');
  // Use official English subtitle from the physical cards (e.g. "Risk & big story")
  const subtitle = meta.defaultSubtitleEn || t(meta.subtitleKey, meta.defaultSubtitleVi);

  return (
    <div
      className={`relative w-full h-full rounded-xl sm:rounded-2xl bg-white text-slate-900 shadow-sm border border-slate-200/90 select-none overflow-hidden flex flex-col justify-between items-center ${
        compact ? 'pt-3.5 pb-2 px-1' : 'pt-5 pb-2.5 px-1 sm:pt-6 sm:pb-3 sm:px-1.5'
      } ${className}`}
    >
      {/* Top-Left Corner Index (Tiny & pinned to extreme corner) */}
      <div className="absolute top-1.5 left-2 sm:top-2 sm:left-2.5 z-20 leading-none pointer-events-none">
        <span className="font-bold text-[7px] sm:text-[7.5px] text-[#e2872c] tracking-tighter">
          {displayVal}
        </span>
      </div>

      {/* Top Section: Large Value + Subtitle (Moved down to completely avoid corner index and fill center space) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full shrink-0">
        {/* Large Primary Value */}
        <span
          className={`font-bold tracking-tight text-[#e2872c] leading-none drop-shadow-2xs ${
            displayVal.length > 2
              ? 'text-sm sm:text-base'
              : compact
                ? 'text-base sm:text-lg'
                : 'text-lg sm:text-xl'
          }`}
        >
          {displayVal}
        </span>

        {/* Subtitle / Meaning Description (Centered, fills card midpoint) */}
        {!compact && subtitle && (
          <span className="text-[6.5px] sm:text-[7.5px] font-medium text-slate-500 tracking-tight text-center leading-none mt-1 sm:mt-1.5 max-w-full px-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
            {subtitle}
          </span>
        )}
      </div>

      {/* Bottom Section: Centered Container Metaphor Stack (Clearance from bottom corner index) */}
      <div className="relative z-10 flex items-center justify-center w-full">
        <div className="w-full flex items-end justify-center">
          <ContainerStackVisual meta={meta} />
        </div>
      </div>

      {/* Inverted Bottom-Right Corner Index (Tiny, pinned to extreme corner, properly rotated) */}
      <div className="absolute bottom-1.5 right-2 sm:bottom-2 sm:right-2.5 z-20 leading-none pointer-events-none">
        <span className="inline-block font-bold text-[7px] sm:text-[7.5px] text-[#e2872c] tracking-tighter rotate-180">
          {displayVal}
        </span>
      </div>
    </div>
  );
});
