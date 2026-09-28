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
  /** Tailwind bg class for traditional note body */
  bg: string;
  /** Tailwind border class for note body */
  border: string;
  /** Tailwind class for 3px top container frame border */
  topBorder: string;
  /** Subtle 4-6% tinted background for ONE Container Card */
  tintBg: string;
  /** Badge color styling for issue tags */
  badgeBg: string;
}

export const STICKY_NOTE_COLORS: StickyNoteColorConfig[] = [
  {
    id: 'yellow',
    translationKey: 'room.stickyNote.color.yellow',
    top: '#fed633',
    paper: '#f3c922',
    base: '#b89410',
    dot: 'bg-[#fed633]',
    bg: 'bg-amber-100/90 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-700/60',
    topBorder: 'bg-amber-400',
    tintBg: 'bg-amber-500/[0.04] dark:bg-amber-400/[0.06]',
    badgeBg: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
  },
  {
    id: 'blue',
    translationKey: 'room.stickyNote.color.blue',
    top: '#a6dbff',
    paper: '#8bcaf3',
    base: '#589ac7',
    dot: 'bg-[#a6dbff]',
    bg: 'bg-sky-100/90 dark:bg-sky-950/40',
    border: 'border-sky-300 dark:border-sky-700/60',
    topBorder: 'bg-sky-500',
    tintBg: 'bg-sky-500/[0.04] dark:bg-sky-400/[0.06]',
    badgeBg: 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20',
  },
  {
    id: 'green',
    translationKey: 'room.stickyNote.color.green',
    top: '#a8e8b7',
    paper: '#8edba0',
    base: '#54a367',
    dot: 'bg-[#a8e8b7]',
    bg: 'bg-emerald-100/90 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-700/60',
    topBorder: 'bg-emerald-500',
    tintBg: 'bg-emerald-500/[0.04] dark:bg-emerald-400/[0.06]',
    badgeBg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
  },
  {
    id: 'pink',
    translationKey: 'room.stickyNote.color.pink',
    top: '#ffbfe0',
    paper: '#f3a4cd',
    base: '#b95a8b',
    dot: 'bg-[#ffbfe0]',
    bg: 'bg-pink-100/90 dark:bg-pink-950/40',
    border: 'border-pink-300 dark:border-pink-700/60',
    topBorder: 'bg-[#E31C79]',
    tintBg: 'bg-[#E31C79]/[0.04] dark:bg-[#E31C79]/[0.08]',
    badgeBg: 'bg-[#E31C79]/10 text-[#CC196C] dark:text-pink-300 border-[#E31C79]/20',
  },
  {
    id: 'orange',
    translationKey: 'room.stickyNote.color.orange',
    top: '#ffc677',
    paper: '#f2b059',
    base: '#b67219',
    dot: 'bg-[#ffc677]',
    bg: 'bg-orange-100/90 dark:bg-orange-950/40',
    border: 'border-orange-300 dark:border-orange-700/60',
    topBorder: 'bg-orange-500',
    tintBg: 'bg-orange-500/[0.04] dark:bg-orange-400/[0.06]',
    badgeBg: 'bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-500/20',
  },
];

/** Map lookup for canvas node rendering (keyed by color id) */
export const STICKY_NOTE_COLOR_MAP: Record<StickyNoteColor, StickyNoteColorConfig> =
  Object.fromEntries(STICKY_NOTE_COLORS.map((c) => [c.id, c])) as Record<
    StickyNoteColor,
    StickyNoteColorConfig
  >;

/** Ordered list of all available color ids */
export const STICKY_NOTE_COLOR_IDS: StickyNoteColor[] = STICKY_NOTE_COLORS.map((c) => c.id);
