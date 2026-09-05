import { useState, useEffect, useRef, useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Pin, Trash2, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useStickyNotes } from '../../context/sticky-notes-context';
import { STICKY_NOTE_COLOR_MAP, STICKY_NOTE_COLOR_IDS } from '../../constants/sticky-note-colors';
import type { StickyNoteProjection, StickyNoteColor } from '../../types/room.types';

interface StickyNoteNodeData {
  note: StickyNoteProjection;
  currentUserId?: string;
  isCurrentAuthor?: boolean;
}

export function StickyNoteNode({ data, selected }: NodeProps) {
  const { note, currentUserId } = data as unknown as StickyNoteNodeData;
  const { t } = useTranslation();
  const {
    editStickyNote,
    togglePinStickyNote,
    deleteStickyNote,
    startEditingStickyNote,
    stopEditingStickyNote,
  } = useStickyNotes();

  const [text, setText] = useState(note?.text || '');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize remote changes only when user is not actively typing
  // (guard prevents overwriting local draft during debounced edits)
  useEffect(() => {
    if (!isFocused) {
      setText(note?.text || '');
    }
  }, [note?.text, isFocused]);

  const isLockedByOther = Boolean(note?.editingBy && note.editingBy.userId !== currentUserId);
  const isSelected = (selected || isFocused) && !isLockedByOther;

  const colorConfig =
    STICKY_NOTE_COLOR_MAP[note?.color || 'yellow'] || STICKY_NOTE_COLOR_MAP.yellow;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      editStickyNote(note.id, newText, note.color);
    }, 300);
  };

  const handleFocus = () => {
    setIsFocused(true);
    startEditingStickyNote(note.id);
  };

  const handleBlur = () => {
    setIsFocused(false);
    stopEditingStickyNote(note.id);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    editStickyNote(note.id, text, note.color);
  };

  const handleColorChange = useCallback(
    (color: StickyNoteColor) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      editStickyNote(note.id, text, color);
    },
    [editStickyNote, note.id, text],
  );

  // Dynamic font sizing for Miro-style centered notes
  const textLength = text.length;
  const fontSizeClass =
    textLength <= 24
      ? 'text-[15px] font-medium leading-snug'
      : textLength <= 60
        ? 'text-[13px] font-normal leading-normal'
        : 'text-xs font-normal leading-relaxed';

  return (
    <div className="relative select-none isolate">
      {/* Locked / Other user typing Presence Pill */}
      {isLockedByOther && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-medium flex items-center gap-1.5 shadow-sm whitespace-nowrap z-50 pointer-events-none">
          <Edit3 className="size-3 animate-spin" />
          <span>
            {note.editingBy?.userName} {t('room.stickyNote.isTyping', 'đang gõ...')}
          </span>
        </div>
      )}

      {/* Floating Miro Toolbar (ONLY shown when note is selected/clicked, cleanly centered above) */}
      {isSelected && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          className="nodrag nopan absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-xl z-50 whitespace-nowrap animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Color Switcher Dots */}
          <div className="flex items-center gap-1.5">
            {STICKY_NOTE_COLOR_IDS.map((c) => (
              <button
                key={c}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleColorChange(c);
                }}
                title={c}
                className={cn(
                  'size-4 rounded-full border border-black/15 transition-transform hover:scale-125 cursor-pointer',
                  STICKY_NOTE_COLOR_MAP[c].dot,
                  note.color === c && 'ring-2 ring-blue-500 scale-110 shadow-sm',
                )}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="h-4 w-[1px] bg-border" />

          {/* Pin / Unpin button */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              togglePinStickyNote(note.id);
            }}
            title={
              note.isPinned
                ? t('room.stickyNote.unpin', 'Bỏ ghim ghi chú')
                : t('room.stickyNote.pin', 'Ghim ghi chú qua các vòng')
            }
            className={cn(
              'size-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer',
              note.isPinned
                ? 'text-amber-600 bg-amber-100 dark:bg-amber-950/60'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <Pin className={cn('size-3.5', note.isPinned && 'rotate-45 fill-amber-500')} />
          </button>

          {/* Delete button */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              deleteStickyNote(note.id);
            }}
            title={t('room.stickyNote.delete', 'Xóa ghi chú')}
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}

      {/* Authentic Miro Dual-Corner Lifted Paper Shadows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {/* Left Corner Lift Shadow */}
        <div className="absolute bottom-[6px] left-[6px] w-[46%] h-[14px] -rotate-[3.5deg] origin-bottom-left shadow-[0_10px_16px_rgba(0,0,0,0.32),0_4px_8px_rgba(0,0,0,0.18)]" />
        {/* Right Corner Lift Shadow */}
        <div className="absolute bottom-[6px] right-[6px] w-[46%] h-[14px] rotate-[3.5deg] origin-bottom-right shadow-[0_10px_16px_rgba(0,0,0,0.32),0_4px_8px_rgba(0,0,0,0.18)]" />
        {/* Ambient Center Bridge Shadow */}
        <div className="absolute bottom-[2px] left-[15%] right-[15%] h-[10px] shadow-[0_6px_12px_rgba(0,0,0,0.22)]" />
      </div>

      {/* Main Miro Sticky Note Body */}
      <div
        onClick={() => {
          if (!isLockedByOther) {
            textareaRef.current?.focus();
          }
        }}
        className={cn(
          'w-[170px] h-[170px] rounded-[2px] p-3.5 flex flex-col items-center justify-center relative z-0 cursor-text transition-all duration-150',
          colorConfig.bg,
          'text-[#1a1a1a]', // Miro classic charcoal text
          'shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
          isSelected && 'ring-2 ring-[#1877f2]',
          isLockedByOther && 'ring-2 ring-amber-400',
        )}
      >
        {/* Subtle top-down paper light reflection */}
        <div className="absolute inset-0 rounded-[2px] bg-gradient-to-b from-white/14 via-transparent to-black/[0.03] pointer-events-none" />

        {/* Pinned pushpin indicator if pinned */}
        {note.isPinned && (
          <div className="absolute top-2 right-2 text-amber-700 pointer-events-none z-10">
            <Pin className="size-3.5 rotate-45 fill-amber-500" />
          </div>
        )}

        {/* Centered Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={isLockedByOther}
          placeholder={isFocused ? '' : t('room.stickyNote.placeholder', 'Nhập ghi chú...')}
          className={cn(
            'nodrag w-full max-h-[135px] resize-none bg-transparent outline-none border-none p-0 tracking-normal scrollbar-none text-center font-sans z-10',
            fontSizeClass,
            isLockedByOther ? 'cursor-not-allowed opacity-60' : 'cursor-text',
          )}
          rows={5}
        />

        {/* Subtle Author Attribution in bottom-left */}
        <div className="absolute left-2.5 bottom-1.5 text-xs text-neutral-800/40 font-medium truncate max-w-[100px] pointer-events-none z-10">
          {note.authorName}
        </div>
      </div>

      {/* Miro 4-Corner Selection Handles when selected */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 size-2 rounded-full bg-white border-2 border-[#1877f2] pointer-events-none" />
          <div className="absolute -top-1 -right-1 size-2 rounded-full bg-white border-2 border-[#1877f2] pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 size-2 rounded-full bg-white border-2 border-[#1877f2] pointer-events-none" />
          <div className="absolute -bottom-1 -right-1 size-2 rounded-full bg-white border-2 border-[#1877f2] pointer-events-none" />
        </>
      )}
    </div>
  );
}
