import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useStickyNotes } from '../../context/sticky-notes-context';
import { STICKY_NOTE_COLORS } from '../../constants/sticky-note-colors';
import type { StickyNoteColor } from '../../types/room.types';

export function StickyNoteStack() {
  const { t } = useTranslation('room');
  const { createStickyNote } = useStickyNotes();
  const [selectedColor, setSelectedColor] = useState<StickyNoteColor>('yellow');
  const [isHovered, setIsHovered] = useState(false);

  const active = STICKY_NOTE_COLORS.find((c) => c.id === selectedColor) || STICKY_NOTE_COLORS[0];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/pointify-sticky-note', selectedColor);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleQuickAdd = () => {
    const offsetRange = 60;
    const x = -380 + Math.round((Math.random() - 0.5) * offsetRange);
    const y = 80 + Math.round((Math.random() - 0.5) * offsetRange);

    createStickyNote({
      color: selectedColor,
      position: { x, y },
      text: '',
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed left-6 bottom-6 z-30 flex flex-col items-start gap-2 select-none"
    >
      {/* Mini Color Palette Pills (appears softly on hover) */}
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/95 backdrop-blur-md border border-border shadow-md transition-all duration-200',
          isHovered
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-1 pointer-events-none',
        )}
      >
        {STICKY_NOTE_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedColor(c.id)}
            title={t(c.translationKey, c.id)}
            className={cn(
              'size-3.5 rounded-full border border-black/10 transition-transform cursor-pointer hover:scale-125',
              c.dot,
              selectedColor === c.id && 'ring-2 ring-primary ring-offset-1 scale-110 shadow-sm',
            )}
          />
        ))}
      </div>

      {/* Standalone Miro Sticky Note Stack Widget */}
      <div
        draggable
        onDragStart={handleDragStart}
        onClick={handleQuickAdd}
        title={t('room.stickyNote.stackTooltip')}
        className="group relative size-17 cursor-grab active:cursor-grabbing transition-transform duration-200 hover:scale-105 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            {/* Soft curved gradient shadow under the peeling sheet */}
            <radialGradient id="stackCurlShadow" cx="95%" cy="85%" r="45%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.32)" />
              <stop offset="40%" stopColor="rgba(0,0,0,0.14)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>

            {/* Subtle paper gradient across the top sheet */}
            <linearGradient id="topSheetGradient" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* 1. Stack Thickness Base Block (dark bottom band) */}
          <rect x="6" y="82" width="88" height="12" rx="1.5" fill={active.base} />

          {/* 2. Exposed Paper Layers under the curl */}
          <rect x="6" y="73" width="88" height="10" fill={active.paper} />

          {/* 3. Drop Shadow under the curled corner */}
          <ellipse
            cx={isHovered ? '87' : '88'}
            cy={isHovered ? '75' : '77'}
            rx={isHovered ? '22' : '17'}
            ry={isHovered ? '13' : '9'}
            fill="url(#stackCurlShadow)"
            className="transition-all duration-300 ease-out"
          />

          {/* 4. Top Sheet with Miro's curved bottom edge and lifted right corner */}
          <path
            d={
              isHovered
                ? 'M 6 6 L 94 6 L 94 65 Q 96 71 99 74 Q 55 80 6 81 Z'
                : 'M 6 6 L 94 6 L 94 70 Q 96 74 98 77 Q 55 81 6 81.5 Z'
            }
            fill={active.top}
            className="transition-all duration-300 ease-out"
          />

          {/* 5. Subtle paper lighting overlay */}
          <path
            d={
              isHovered
                ? 'M 6 6 L 94 6 L 94 65 Q 96 71 99 74 Q 55 80 6 81 Z'
                : 'M 6 6 L 94 6 L 94 70 Q 96 74 98 77 Q 55 81 6 81.5 Z'
            }
            fill="url(#topSheetGradient)"
            className="transition-all duration-300 ease-out pointer-events-none"
          />

          {/* 6. Very subtle top glue guideline */}
          <line x1="12" y1="8" x2="88" y2="8" stroke="rgba(0,0,0,0.04)" strokeWidth="0.8" />
        </svg>
      </div>
    </div>
  );
}
