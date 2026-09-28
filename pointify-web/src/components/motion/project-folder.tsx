'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useHoverCapable } from '@/lib/hooks/use-hover-capable';
import { cn } from '@/lib/utils';

export type ProjectFolderPreview = {
  id: string;
  content: ReactNode;
  onClick?: () => void;
  selected?: boolean;
};

export interface ProjectFolderProps {
  title: string;
  description?: string;
  previews?: ProjectFolderPreview[];
  items?: ProjectFolderPreview[];
  count?: number;
  itemLabel?: string;
  statusText?: string;
  size?: 'sm' | 'default';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

const MAX_PREVIEWS = 5;

function getPreviewTransform(index: number, count: number, isCompact = false) {
  const offset = index - (count - 1) / 2;
  const distance = Math.abs(offset);
  const centerLift = Math.max(0, 2 - distance) * (isCompact ? 5 : 8);

  return {
    x: offset * (isCompact ? 28 : 44),
    y: (isCompact ? 4 : 8) - centerLift,
    rotate: offset * 6,
    scale: distance === 0 ? 1.04 : distance === 1 ? 0.95 : 0.88,
    opacity: distance === 0 ? 1 : distance === 1 ? 0.82 : 0.65,
    zIndex: 10 - distance,
  };
}

export function ProjectFolder({
  title,
  description = 'Updated recently',
  previews = [],
  items,
  count = items?.length ?? previews.length,
  itemLabel = 'file',
  statusText,
  size = 'default',
  open,
  defaultOpen = false,
  onOpenChange,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  onClick,
  disabled = false,
  ariaLabel,
  className,
}: ProjectFolderProps) {
  const isCompact = size === 'sm';
  const canHover = useHoverCapable();
  const folderButtonRef = useRef<HTMLButtonElement>(null);

  const [mounted, setMounted] = useState(false);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openControlled = open !== undefined;
  const expandedControlled = expanded !== undefined;

  const isExpanded = expanded ?? internalExpanded;
  const isHoverOpen = (open ?? internalOpen) && !isExpanded;

  const previewItems = previews.slice(0, MAX_PREVIEWS);
  const displayItems = items ?? previewItems;
  const countText =
    count === 1
      ? `1 ${itemLabel}`
      : itemLabel.endsWith('s') || itemLabel === 'lá'
        ? `${count} ${itemLabel}`
        : `${count} ${itemLabel}s`;

  const handleOpenHover = useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (!openControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [disabled, onOpenChange, openControlled],
  );

  const handleExpandedChange = useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (!expandedControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
      if (!next) {
        handleOpenHover(false);
      }
    },
    [disabled, expandedControlled, onExpandedChange, handleOpenHover],
  );

  // Close on Escape & Lock body scroll when overlay is open
  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExpandedChange(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, handleExpandedChange]);

  const overlayContent = (
    <AnimatePresence>
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background mờ dần hiện lên */}
          <motion.div
            key="deck-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={() => handleExpandedChange(false)}
            aria-hidden="true"
            className="fixed inset-0 bg-background/80 backdrop-blur-xl cursor-default"
          />

          {/* Modal Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <div className="pointer-events-auto relative w-full max-w-5xl my-auto py-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="mb-6 flex items-center justify-between gap-4 px-2"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    {title}
                  </h2>
                  <div className="mt-1 flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{countText}</span>
                    {statusText && (
                      <>
                        <span className="size-1 rounded-full bg-border" />
                        <span className="font-semibold text-[#E31C79]">{statusText}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleExpandedChange(false)}
                  aria-label={`Close ${title}`}
                  className="flex size-10 items-center justify-center rounded-full border border-foreground/10 bg-background/70 text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </motion.div>

              {/* Từng lá bài chạy lên giữa màn hình */}
              <div className="grid grid-cols-2 place-items-center gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {displayItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 60, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{
                      duration: 0.28,
                      delay: 0.03 + index * 0.028,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ scale: 1.05, y: -6 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={item.onClick}
                    className={cn(
                      'aspect-[2/3] w-full max-w-40 rounded-xl cursor-pointer select-none transition-shadow',
                      item.selected ? '-translate-y-1.5' : '',
                    )}
                  >
                    {item.content}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={folderButtonRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? title}
        aria-haspopup="dialog"
        aria-expanded={isExpanded}
        onPointerEnter={() => {
          if (!canHover) return;
          handleOpenHover(true);
        }}
        onPointerLeave={() => {
          if (!canHover) return;
          handleOpenHover(false);
        }}
        onClick={() => {
          handleExpandedChange(true);
          onClick?.();
        }}
        className={cn(
          isCompact
            ? 'relative block h-32 w-44 select-none rounded-xl text-left outline-none [perspective:1000px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-transform duration-150 active:scale-[0.98]'
            : 'relative block h-56 w-72 select-none rounded-2xl text-left outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-transform duration-150 active:scale-[0.98]',
          className,
        )}
      >
        {/* Back Flap */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-0 bg-background/25 backdrop-blur-xl [transform-origin:center_bottom] transition-transform duration-200 ease-out',
            isHoverOpen
              ? isCompact
                ? '[transform:rotateX(12deg)]'
                : '[transform:rotateX(15deg)]'
              : '',
            isCompact ? 'rounded-xl' : 'rounded-2xl',
          )}
        />

        {/* Fanned Preview Cards (stays inside button) */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute left-1/2 top-0 block h-0 w-0">
            {previewItems.map((preview, index) => {
              const opened = getPreviewTransform(index, previewItems.length, isCompact);
              const transform = isHoverOpen
                ? `translate3d(${opened.x * (isCompact ? 1.35 : 1.4)}px, ${opened.y - (isCompact ? 6 : 8)}px, 0) rotate(${opened.rotate * (isCompact ? 1.2 : 1.3)}deg) scale(${opened.scale * 1.02})`
                : `translate3d(${opened.x}px, ${opened.y}px, 0) rotate(${opened.rotate}deg) scale(${opened.scale})`;

              return (
                <span
                  key={preview.id}
                  className={cn(
                    'absolute left-0 top-0 overflow-hidden pointer-events-none rounded-xl transition-all duration-200 ease-out',
                    isCompact
                      ? '-ml-8 block h-24 w-16 shadow-md'
                      : '-ml-12 block h-40 w-24 shadow-lg',
                  )}
                  style={{
                    transform,
                    opacity: isHoverOpen ? Math.min(1, opened.opacity + 0.18) : opened.opacity,
                    zIndex: opened.zIndex,
                  }}
                >
                  {preview.content}
                </span>
              );
            })}
          </span>
        </span>

        {/* Front Flap */}
        <span
          className={cn(
            'absolute inset-x-0 bottom-0 z-20 overflow-hidden border border-foreground/10 bg-background/60 backdrop-blur-2xl [backface-visibility:hidden] [transform-origin:center_bottom] transition-transform duration-200 ease-out',
            isHoverOpen
              ? isCompact
                ? '[transform:rotateX(-20deg)]'
                : '[transform:rotateX(-25deg)]'
              : '',
            isCompact ? 'rounded-xl' : 'rounded-2xl',
          )}
        >
          <span className={cn('flex items-center px-3 sm:px-4', isCompact ? 'h-11' : 'h-16')}>
            <span
              className={cn(
                'line-clamp-1 font-semibold leading-tight text-foreground',
                isCompact ? 'text-sm' : 'text-xl',
              )}
            >
              {title}
            </span>
          </span>
          <span
            className={cn(
              'flex items-center justify-between gap-2 border-t border-foreground/10 px-3 sm:px-4',
              isCompact ? 'h-8 text-[11px]' : 'h-12 text-sm',
            )}
          >
            <span className="shrink-0 font-medium text-foreground/80">{countText}</span>
            <span className="truncate text-muted-foreground">{description}</span>
          </span>
        </span>
      </button>

      {mounted ? createPortal(overlayContent, document.body) : null}
    </>
  );
}
