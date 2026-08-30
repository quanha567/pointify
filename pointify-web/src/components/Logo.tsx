import React from 'react';
import { cn } from '@/lib/utils';

export interface LogoProps {
  /**
   * Layout variant:
   * - 'full': Icon mark + 'Pointify' wordmark (+ optional subtitle badge)
   * - 'icon': Just the standalone monogram vector icon
   * - 'wordmark': Just the stylized typographic wordmark
   */
  variant?: 'full' | 'icon' | 'wordmark';
  /**
   * Predefined size or custom numeric pixel height
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /**
   * Whether to display the small 'Scrum Poker' badge under the wordmark
   */
  showBadge?: boolean;
  /**
   * Optional custom badge text (defaults to 'Scrum Poker')
   */
  badgeText?: string;
  /**
   * Whether to enable micro-hover animations
   */
  animated?: boolean;
  /**
   * Additional root container CSS classes
   */
  className?: string;
  /**
   * Additional icon SVG classes
   */
  iconClassName?: string;
}

const sizeConfig = {
  sm: { iconSize: 28, textSize: 'text-base', badgeSize: 'text-[9px]', gap: 'gap-2' },
  md: { iconSize: 36, textSize: 'text-lg', badgeSize: 'text-[10px]', gap: 'gap-2.5' },
  lg: { iconSize: 48, textSize: 'text-2xl', badgeSize: 'text-xs', gap: 'gap-3' },
  xl: { iconSize: 64, textSize: 'text-3xl', badgeSize: 'text-sm', gap: 'gap-3.5' },
};

export const LogoIcon: React.FC<{
  size?: number;
  className?: string;
  animated?: boolean;
}> = ({ size = 36, className, animated = true }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'shrink-0 transition-all duration-300',
        animated &&
          'hover:scale-105 group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(6,182,212,0.25)]',
        className,
      )}
      aria-label="Pointify Logo Icon"
    >
      <defs>
        {/* Primary Stem Gradient: Cyan -> Royal Blue -> Indigo */}
        <linearGradient id="pointify-stem-grad-react" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Loop Accent Gradient: Light Cyan -> Indigo -> Violet */}
        <linearGradient id="pointify-loop-grad-react" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="55%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Glowing Central Point */}
        <linearGradient id="pointify-point-grad-react" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0F9FF" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Gloss Overlay */}
        <linearGradient id="pointify-gloss-react" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>

        <filter
          id="pointify-card-shadow-react"
          x="-10%"
          y="-10%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.2" />
        </filter>

        <filter
          id="pointify-dot-glow-react"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Stem Card (Vertical poker card forming the backbone of 'P') */}
      <g filter="url(#pointify-card-shadow-react)">
        <rect x="16" y="14" width="22" height="72" rx="8" fill="url(#pointify-stem-grad-react)" />
        <rect x="16" y="14" width="22" height="72" rx="8" fill="url(#pointify-gloss-react)" />
        {/* Detail indicator lines representing card scale */}
        <line
          x1="22"
          y1="24"
          x2="32"
          y2="24"
          stroke="#FFFFFF"
          strokeOpacity="0.65"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="22"
          y1="32"
          x2="28"
          y2="32"
          stroke="#FFFFFF"
          strokeOpacity="0.45"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* Loop Card (Overlapping horizontal rounded card forming the loop of 'P') */}
      <g filter="url(#pointify-card-shadow-react)">
        <path
          d="M34 14 H63 C76.8 14 88 25.2 88 39 C88 52.8 76.8 64 63 64 H34 V48 H61 C66 48 70 44 70 39 C70 34 66 30 61 30 H34 Z"
          fill="url(#pointify-loop-grad-react)"
        />
        <path
          d="M34 14 H63 C76.8 14 88 25.2 88 39 C88 52.8 76.8 64 63 64 H34 V48 H61 C66 48 70 44 70 39 C70 34 66 30 61 30 H34 Z"
          fill="url(#pointify-gloss-react)"
        />
      </g>

      {/* Central Estimation Point (The focal 'Point') */}
      <g filter="url(#pointify-dot-glow-react)">
        <circle cx="53" cy="39" r="8" fill="#38BDF8" fillOpacity="0.35" />
        <circle cx="53" cy="39" r="5.2" fill="url(#pointify-point-grad-react)" />
        <circle cx="51.5" cy="37.5" r="1.6" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  showBadge = true,
  badgeText = 'Scrum Poker',
  animated = true,
  className,
  iconClassName,
}) => {
  const currentSize =
    typeof size === 'number'
      ? { iconSize: size, textSize: 'text-lg', badgeSize: 'text-[10px]', gap: 'gap-2.5' }
      : sizeConfig[size] || sizeConfig.md;

  if (variant === 'icon') {
    return (
      <LogoIcon
        size={currentSize.iconSize}
        className={cn(className, iconClassName)}
        animated={animated}
      />
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={cn('flex flex-col select-none leading-none', className)}>
        <span
          className={cn(
            'font-extrabold tracking-tight bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent',
            currentSize.textSize,
          )}
        >
          Pointify
        </span>
        {showBadge && (
          <span
            className={cn(
              'text-muted-foreground font-medium mt-0.5 tracking-wider uppercase opacity-80',
              currentSize.badgeSize,
            )}
          >
            {badgeText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center group cursor-pointer select-none',
        currentSize.gap,
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <LogoIcon size={currentSize.iconSize} className={iconClassName} animated={animated} />
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-black tracking-tight bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent transition-all duration-300 group-hover:brightness-110',
            currentSize.textSize,
          )}
        >
          Pointify
        </span>
        {showBadge && (
          <span
            className={cn(
              'text-muted-foreground font-medium mt-0.5 tracking-wider uppercase opacity-75 hidden sm:inline',
              currentSize.badgeSize,
            )}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
