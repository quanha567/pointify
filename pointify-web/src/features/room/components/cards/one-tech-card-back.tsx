import { memo } from 'react';
import oneTechLogo from '@/assets/one-tech-stop-logo-white.png';

interface OneTechCardBackProps {
  className?: string;
}

export const OneTechCardBack = memo(function OneTechCardBack({
  className = '',
}: OneTechCardBackProps) {
  return (
    <div
      className={`relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden select-none flex items-center justify-center shadow-lg border border-pink-400/40 ${className}`}
      style={{
        background: 'linear-gradient(160deg, #df196d 0%, #d40d65 45%, #be0857 100%)',
      }}
    >
      {/* Tactile Vertical Ribbed Stripes Texture (matching Image 2) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage: `repeating-linear-gradient(
            to right,
            transparent 0px,
            transparent 3px,
            rgba(255, 255, 255, 0.22) 3.5px,
            rgba(255, 255, 255, 0.22) 4.5px,
            rgba(0, 0, 0, 0.25) 5px,
            rgba(0, 0, 0, 0.25) 6px
          )`,
        }}
      />

      {/* Subtle Inner Bezel Highlight */}
      <div className="absolute inset-1 sm:inset-1.5 rounded-lg sm:rounded-xl border border-white/30 pointer-events-none" />

      {/* Center Official One Tech Stop Logo (100% matched to brand asset) */}
      <div className="relative z-10 flex items-center justify-center w-full px-2">
        <img
          src={oneTechLogo}
          alt="ONE TECH STOP"
          className="w-[88%] max-h-[72%] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] pointer-events-none select-none"
        />
      </div>

      {/* Tactile Ambient Reflection Gloss */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
    </div>
  );
});
