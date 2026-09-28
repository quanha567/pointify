import React from 'react';
import { cn } from '@/lib/utils';
import otsLogo from '@/assets/ots-logo.png';

export interface LogoProps {
  /**
   * Layout variant:
   * - 'full': Primary OTS logo
   * - 'icon': Standalone OTS mark
   * - 'wordmark': Standalone OTS mark
   */
  variant?: 'full' | 'icon' | 'wordmark';
  /**
   * Predefined size or custom numeric pixel height
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /**
   * Maintained for backwards compatibility
   */
  showBadge?: boolean;
  /**
   * Maintained for backwards compatibility
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
   * Additional icon/image CSS classes
   */
  iconClassName?: string;
}

const sizeConfig = {
  sm: { height: 26 },
  md: { height: 32 },
  lg: { height: 42 },
  xl: { height: 52 },
};

export const LogoIcon: React.FC<{
  size?: number;
  className?: string;
  animated?: boolean;
}> = ({ size = 32, className, animated = true }) => {
  const width = Math.round(size * (162 / 62));
  return (
    <img
      src={otsLogo}
      alt="ONE Tech Stop"
      width={width}
      height={size}
      style={{ height: `${size}px`, width: 'auto' }}
      className={cn(
        'shrink-0 object-contain select-none transition-transform duration-200 ease-out',
        animated && 'hover:scale-105 active:scale-95',
        className,
      )}
      draggable={false}
    />
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  animated = true,
  className,
  iconClassName,
}) => {
  const currentHeight =
    typeof size === 'number' ? size : (sizeConfig[size] || sizeConfig.md).height;

  if (variant === 'icon') {
    return (
      <LogoIcon size={currentHeight} className={cn(className, iconClassName)} animated={animated} />
    );
  }

  const currentWidth = Math.round(currentHeight * (162 / 62));

  return (
    <div className={cn('inline-flex items-center group cursor-pointer select-none', className)}>
      <img
        src={otsLogo}
        alt="ONE Tech Stop"
        width={currentWidth}
        height={currentHeight}
        style={{ height: `${currentHeight}px`, width: 'auto' }}
        className={cn(
          'shrink-0 object-contain select-none transition-transform duration-200 ease-out',
          animated && 'group-hover:scale-105 active:scale-95',
          iconClassName,
        )}
        draggable={false}
      />
    </div>
  );
};
