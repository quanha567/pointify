import type { StickyNoteColor } from '../types/room.types';

/* ─── Unified Sticky Note Color Configuration ─────────────────────────
 * Single source of truth for all sticky note color variants.
 * Consumed by: StickyNoteNode (canvas), StickyNoteStack (HUD).
 * ─────────────────────────────────────────────────────────────────── */

export interface StickyNoteColorConfig {
  id: StickyNoteColor;
  /** i18n translation key for the color label */
  translationKey: string;
  /** SVG fill for top sheet of stack widget */
  top: string;
  /** SVG fill for exposed paper layer */
  paper: string;
  /** SVG fill for stack base band */
  base: string;
  /** Tailwind bg class for color dot */
  dot: string;
  /** Tailwind bg class for note body */
  bg: string;
  /** Tailwind border class for note body */
  border: string;
}

export const STICKY_NOTE_COLORS: StickyNoteColorConfig[] = [
  {
    id: 'yellow',
    translationKey: 'room.stickyNote.color.yellow',
    top: '#fed633',
    paper: '#f3c922',
    base: '#b89410',
    dot: 'bg-[#fed633]',
    bg: 'bg-[#fed633]',
    border: 'border-[#eed145]',
  },
  {
    id: 'blue',
    translationKey: 'room.stickyNote.color.blue',
    top: '#a6dbff',
    paper: '#8bcaf3',
    base: '#589ac7',
    dot: 'bg-[#a6dbff]',
    bg: 'bg-[#a6dbff]',
    border: 'border-[#90d0fa]',
  },
  {
    id: 'green',
    translationKey: 'room.stickyNote.color.green',
    top: '#a8e8b7',
    paper: '#8edba0',
    base: '#54a367',
    dot: 'bg-[#a8e8b7]',
    bg: 'bg-[#a8e8b7]',
    border: 'border-[#92de9f]',
  },
  {
    id: 'pink',
    translationKey: 'room.stickyNote.color.pink',
    top: '#ffbfe0',
    paper: '#f3a4cd',
    base: '#b95a8b',
    dot: 'bg-[#ffbfe0]',
    bg: 'bg-[#ffbfe0]',
    border: 'border-[#f5aacf]',
  },
  {
    id: 'orange',
    translationKey: 'room.stickyNote.color.orange',
    top: '#ffc677',
    paper: '#f2b059',
    base: '#b67219',
    dot: 'bg-[#ffc677]',
    bg: 'bg-[#ffc677]',
    border: 'border-[#f6be7f]',
  },
];

/** Map lookup for canvas node rendering (keyed by color id) */
export const STICKY_NOTE_COLOR_MAP: Record<
  StickyNoteColor,
  { bg: string; border: string; dot: string }
> = Object.fromEntries(
  STICKY_NOTE_COLORS.map((c) => [c.id, { bg: c.bg, border: c.border, dot: c.dot }]),
) as Record<StickyNoteColor, { bg: string; border: string; dot: string }>;

/** Ordered list of all available color ids */
export const STICKY_NOTE_COLOR_IDS: StickyNoteColor[] = STICKY_NOTE_COLORS.map((c) => c.id);
