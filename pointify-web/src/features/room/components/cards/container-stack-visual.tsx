import { memo } from 'react';
import { Coffee, HelpCircle, AlertTriangle } from 'lucide-react';
import type { CardVisualMeta } from '../../constants/card-metadata';

interface ContainerStackVisualProps {
  meta: CardVisualMeta;
  className?: string;
}

/* ── Single Shipping Container SVG Primitive ─────────────────── */
function ContainerBox({ color = 'pink' }: { color?: 'pink' | 'silver' }) {
  const isPink = color === 'pink';
  const fillBg = isPink ? '#d40d65' : '#e2e8f0';
  const strokeLine = isPink ? '#b70954' : '#cbd5e1';
  const ridgeLine = isPink ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.15)';

  return (
    <svg
      viewBox="0 0 20 14"
      className="w-full h-auto aspect-[20/14] shrink-0 block"
      preserveAspectRatio="none"
    >
      {/* Container Body */}
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="13"
        rx="1.5"
        fill={fillBg}
        stroke={strokeLine}
        strokeWidth="0.8"
      />
      {/* Corrugated Ridges (Vân dập nổi container) */}
      <line x1="4.5" y1="2" x2="4.5" y2="12" stroke={ridgeLine} strokeWidth="0.8" />
      <line x1="8" y1="2" x2="8" y2="12" stroke={ridgeLine} strokeWidth="0.8" />
      <line x1="11.5" y1="2" x2="11.5" y2="12" stroke={ridgeLine} strokeWidth="0.8" />
      <line x1="15" y1="2" x2="15" y2="12" stroke={ridgeLine} strokeWidth="0.8" />
      {/* Center badge accent */}
      <rect
        x="7.5"
        y="5.5"
        width="5"
        height="3"
        rx="0.5"
        fill={isPink ? '#ffffff' : '#d40d65'}
        opacity="0.8"
      />
    </svg>
  );
}

export const ContainerStackVisual = memo(function ContainerStackVisual({
  meta,
  className = '',
}: ContainerStackVisualProps) {
  const { containerCount, specialIcon } = meta;

  // 1. Special Icon: Coffee Break
  if (specialIcon === 'coffee') {
    return (
      <div
        className={`flex flex-col items-center justify-center text-amber-600 scale-90 sm:scale-100 ${className}`}
      >
        <Coffee className="size-4 sm:size-4.5 stroke-[2.2] animate-bounce" />
        <div className="w-5 h-2 mt-0.5">
          <ContainerBox color="silver" />
        </div>
      </div>
    );
  }

  // 2. Special Icon: Question Mark
  if (specialIcon === 'question') {
    return (
      <div
        className={`flex flex-col items-center justify-center text-pink-600 scale-90 sm:scale-100 ${className}`}
      >
        <HelpCircle className="size-4 sm:size-4.5 stroke-[2.2]" />
      </div>
    );
  }

  // 3. Special Icon: Empty Pallet (Value 0)
  if (specialIcon === 'pallet' || containerCount === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-end w-6 sm:w-7 h-3 sm:h-3.5 ${className}`}
      >
        {/* Cargo Pallet Platform */}
        <div className="w-5.5 sm:w-6.5 h-1.5 sm:h-2 rounded-xs bg-amber-800/60 border border-amber-950/40 relative flex justify-around items-center px-0.5">
          <span className="w-0.5 h-0.5 bg-amber-950/40 rounded-xs" />
          <span className="w-0.5 h-0.5 bg-amber-950/40 rounded-xs" />
          <span className="w-0.5 h-0.5 bg-amber-950/40 rounded-xs" />
        </div>
      </div>
    );
  }

  // 4. Exact 13 Containers Layout (Matching physical card stepped pyramid)
  if (containerCount === 13) {
    return (
      <div
        className={`flex flex-col items-center justify-end w-7.5 sm:w-8.5 h-6 sm:h-7 ${className}`}
      >
        {/* Tier 4 (Top): 2 containers */}
        <div className="flex justify-start w-full gap-0.5 px-0.5">
          <div className="w-[23%]">
            <ContainerBox color="silver" />
          </div>
          <div className="w-[23%]">
            <ContainerBox color="pink" />
          </div>
        </div>
        {/* Tier 3: 3 containers */}
        <div className="flex justify-start w-full gap-0.5 px-0.5 -mt-0.5">
          <div className="w-[23%]">
            <ContainerBox color="pink" />
          </div>
          <div className="w-[23%]">
            <ContainerBox color="silver" />
          </div>
          <div className="w-[23%]">
            <ContainerBox color="pink" />
          </div>
        </div>
        {/* Tier 2: 4 containers */}
        <div className="flex justify-start w-full gap-0.5 px-0.5 -mt-0.5">
          <div className="w-[23%]">
            <ContainerBox color="silver" />
          </div>
          <div className="w-[23%]">
            <ContainerBox color="pink" />
          </div>
          <div className="w-[23%]">
            <ContainerBox color="silver" />
          </div>
          <div className="w-[23%]">
            <ContainerBox color="pink" />
          </div>
        </div>
        {/* Tier 1 (Bottom): 4 containers */}
        <div className="flex justify-start w-full gap-0.5 px-0.5 -mt-0.5">
          <div className="w-[23%]">
            <ContainerBox color="pink" />
          </div>
          <div className="w-[23%]">
            <ContainerBox color="silver" />
          </div>
          <div className="w-[23%]">
            <ContainerBox color="pink" />
          </div>
          <div className="w-[23%]">
            <ContainerBox color="silver" />
          </div>
        </div>
      </div>
    );
  }

  // 5. Value 1: Single container
  if (containerCount === 1) {
    return (
      <div className={`flex items-end justify-center w-4.5 sm:w-5 h-4 sm:h-4.5 ${className}`}>
        <div className="w-full">
          <ContainerBox color="pink" />
        </div>
      </div>
    );
  }

  // 6. Value 2: Two containers side-by-side
  if (containerCount === 2) {
    return (
      <div
        className={`flex items-end justify-center w-6.5 sm:w-7.5 h-3.5 sm:h-4 gap-0.5 ${className}`}
      >
        <div className="w-1/2">
          <ContainerBox color="pink" />
        </div>
        <div className="w-1/2">
          <ContainerBox color="silver" />
        </div>
      </div>
    );
  }

  // 7. Value 3: Pyramid of 3
  if (containerCount === 3) {
    return (
      <div
        className={`flex flex-col items-center justify-end w-6.5 sm:w-7.5 h-5 sm:h-5.5 ${className}`}
      >
        <div className="w-[46%]">
          <ContainerBox color="silver" />
        </div>
        <div className="flex w-full gap-0.5 -mt-0.5">
          <div className="w-1/2">
            <ContainerBox color="pink" />
          </div>
          <div className="w-1/2">
            <ContainerBox color="silver" />
          </div>
        </div>
      </div>
    );
  }

  // 8. Value 5: 2 on top, 3 at bottom
  if (containerCount === 5) {
    return (
      <div
        className={`flex flex-col items-center justify-end w-7 sm:w-8 h-5 sm:h-5.5 ${className}`}
      >
        <div className="flex justify-center w-[66%] gap-0.5">
          <div className="w-1/2">
            <ContainerBox color="silver" />
          </div>
          <div className="w-1/2">
            <ContainerBox color="pink" />
          </div>
        </div>
        <div className="flex w-full gap-0.5 -mt-0.5">
          <div className="w-1/3">
            <ContainerBox color="pink" />
          </div>
          <div className="w-1/3">
            <ContainerBox color="silver" />
          </div>
          <div className="w-1/3">
            <ContainerBox color="pink" />
          </div>
        </div>
      </div>
    );
  }

  // 9. Value 8: 3 tiers (2-3-3)
  if (containerCount === 8) {
    return (
      <div
        className={`flex flex-col items-center justify-end w-7 sm:w-8 h-6 sm:h-6.5 ${className}`}
      >
        <div className="flex justify-center w-[66%] gap-0.5">
          <div className="w-1/2">
            <ContainerBox color="silver" />
          </div>
          <div className="w-1/2">
            <ContainerBox color="pink" />
          </div>
        </div>
        <div className="flex w-full gap-0.5 -mt-0.5">
          <div className="w-1/3">
            <ContainerBox color="pink" />
          </div>
          <div className="w-1/3">
            <ContainerBox color="silver" />
          </div>
          <div className="w-1/3">
            <ContainerBox color="pink" />
          </div>
        </div>
        <div className="flex w-full gap-0.5 -mt-0.5">
          <div className="w-1/3">
            <ContainerBox color="silver" />
          </div>
          <div className="w-1/3">
            <ContainerBox color="pink" />
          </div>
          <div className="w-1/3">
            <ContainerBox color="silver" />
          </div>
        </div>
      </div>
    );
  }

  // 10. Value 21+: Stack with caution warning
  return (
    <div
      className={`flex flex-col items-center justify-end w-7.5 sm:w-8.5 h-6 sm:h-7 relative ${className}`}
    >
      {/* Alert Triangle indicator */}
      <AlertTriangle className="size-2 sm:size-2.5 text-amber-500 mb-0.5" />
      <div className="flex w-full gap-0.5">
        <div className="w-1/4">
          <ContainerBox color="silver" />
        </div>
        <div className="w-1/4">
          <ContainerBox color="pink" />
        </div>
        <div className="w-1/4">
          <ContainerBox color="silver" />
        </div>
        <div className="w-1/4">
          <ContainerBox color="pink" />
        </div>
      </div>
      <div className="flex w-full gap-0.5 -mt-0.5">
        <div className="w-1/4">
          <ContainerBox color="pink" />
        </div>
        <div className="w-1/4">
          <ContainerBox color="silver" />
        </div>
        <div className="w-1/4">
          <ContainerBox color="pink" />
        </div>
        <div className="w-1/4">
          <ContainerBox color="silver" />
        </div>
      </div>
    </div>
  );
});
