import { useState, useEffect, useRef, useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Pin, Trash2, Edit3, ExternalLink, Play, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useStickyNotes } from '../../context/sticky-notes-context';
import { STICKY_NOTE_COLOR_MAP, STICKY_NOTE_COLOR_IDS } from '../../constants/sticky-note-colors';
import type { StickyNoteProjection, StickyNoteColor } from '../../types/room.types';

interface StickyNoteNodeData {
  note: StickyNoteProjection;
  currentUserId?: string;
  isCurrentAuthor?: boolean;
  isFacilitator?: boolean;
  roomId?: string;
  isEstimating?: boolean;
}

export function StickyNoteNode({ data, selected }: NodeProps) {
  const { note, currentUserId, isFacilitator, isEstimating } =
    data as unknown as StickyNoteNodeData;
  const { t } = useTranslation('room');
  const {
    editStickyNote,
    togglePinStickyNote,
    deleteStickyNote,
    startEditingStickyNote,
    stopEditingStickyNote,
    estimateStory,
  } = useStickyNotes();

  const isJiraStory = Boolean(note?.jiraKey);
  const [text, setText] = useState(note?.text || '');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize remote changes only for editable notes when user is not actively typing
  useEffect(() => {
    if (!isFocused) {
      setText(note?.text || '');
    }
  }, [note?.text, isFocused]);

  const isLockedByOther = Boolean(note?.editingBy && note.editingBy.userId !== currentUserId);
  const isSelected = (selected || isFocused) && !isLockedByOther;

  const colorConfig = STICKY_NOTE_COLOR_MAP[note?.color || 'blue'] || STICKY_NOTE_COLOR_MAP.blue;

  const hasStoryPoints = note?.storyPoints !== undefined && note?.storyPoints !== null;

  // General note editable handlers
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isJiraStory) return;
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
    if (isJiraStory) return;
    setIsFocused(true);
    startEditingStickyNote(note.id);
  };

  const handleBlur = () => {
    if (isJiraStory) return;
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
    [editStickyNote, note?.id, text],
  );

  const handleEstimateAction = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      estimateStory?.(note?.jiraKey || '', text || note?.text || '');
    },
    [estimateStory, note?.jiraKey, note?.text, text],
  );

  const canEstimate = isFacilitator && (Boolean(note?.jiraKey) || text.trim().length > 0);

  return (
    <div className="relative select-none isolate">
      {/* Remote Typing Presence Pill (only for editable general sticky notes) */}
      {!isJiraStory && isLockedByOther && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-medium flex items-center gap-1.5 shadow-sm whitespace-nowrap z-50 pointer-events-none">
          <Edit3 className="size-3 animate-spin" />
          <span>
            {note.editingBy?.userName} {t('room.stickyNote.isTyping')}
          </span>
        </div>
      )}

      {/* Floating Toolbar (Shown when note is selected/focused) */}
      {isSelected && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          className="nodrag nopan absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-card/95 backdrop-blur-md border border-border shadow-xl z-50 whitespace-nowrap animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Facilitator Quick Estimate / Re-estimate Action */}
          {canEstimate && (
            <>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={handleEstimateAction}
                title={
                  hasStoryPoints
                    ? t('room.stickyNote.reestimateThisStory')
                    : t('room.stickyNote.estimateThisStory')
                }
                className="h-7 px-2.5 rounded-md flex items-center gap-1.5 bg-[#E31C79] hover:bg-[#CC196C] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {hasStoryPoints ? (
                  <>
                    <RotateCcw className="size-3" />
                    <span>{t('room.stickyNote.reestimateThisStory')}</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3 fill-current" />
                    <span>{t('room.stickyNote.estimateThisStory')}</span>
                  </>
                )}
              </button>
              <div className="h-4 w-[1px] bg-border" />
            </>
          )}

          {/* Color Switcher Dots */}
          <div className="flex items-center gap-1 px-0.5">
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
                  'size-3.5 rounded-full border border-black/15 transition-transform hover:scale-125 cursor-pointer',
                  STICKY_NOTE_COLOR_MAP[c].dot,
                  note.color === c && 'ring-2 ring-primary scale-110 shadow-xs',
                )}
              />
            ))}
          </div>

          <div className="h-4 w-[1px] bg-border" />

          {/* External Jira Cloud link if Jira issue */}
          {isJiraStory && note.jiraUrl && (
            <a
              href={note.jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              title={t('room.stickyNote.openInJira')}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}

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
            title={note.isPinned ? t('room.stickyNote.unpin') : t('room.stickyNote.pin')}
            className={cn(
              'size-7 rounded-md flex items-center justify-center transition-colors cursor-pointer',
              note.isPinned
                ? 'text-amber-600 bg-amber-500/15 dark:bg-amber-950/60'
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
            title={t('room.stickyNote.delete')}
            className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}

      {/* ─── Main Sticky Note Container (180x180px Square) ─── */}
      <div
        onClick={() => {
          if (!isJiraStory && !isLockedByOther) {
            textareaRef.current?.focus();
          }
        }}
        className={cn(
          'w-[180px] h-[180px] rounded-lg relative z-0 flex flex-col justify-between overflow-hidden transition-all duration-150',
          'bg-card/95 backdrop-blur-xs border border-border/80 shadow-xs hover:shadow-md',
          colorConfig.tintBg,
          isSelected && 'ring-2 ring-primary/80',
          isEstimating && 'ring-2 ring-[#E31C79] shadow-md shadow-[#E31C79]/20 animate-pulse',
          isLockedByOther && 'ring-2 ring-amber-400',
        )}
      >
        {/* The Container Frame: 3px Top Border */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-[3px] z-20',
            isEstimating ? 'bg-[#E31C79]' : colorConfig.topBorder,
          )}
        />

        {/* ─── BRANCH 1: JIRA USER STORY CARD (READ-ONLY) ─── */}
        {isJiraStory ? (
          <>
            {/* Header: Story Key + Issue Type + Pin */}
            <div className="w-full h-8 px-2.5 pt-1 flex items-center justify-between border-b border-border/40 shrink-0 z-10">
              <a
                href={note.jiraUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 font-mono font-bold text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 hover:underline shrink-0"
                title={note.jiraKey}
              >
                <span>{note.jiraKey}</span>
                <ExternalLink className="size-2.5 opacity-60" />
              </a>

              <div className="flex items-center gap-1 shrink-0">
                {note.issueType && (
                  <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-sm bg-muted text-muted-foreground uppercase tracking-wider">
                    {note.issueType}
                  </span>
                )}
                {note.isPinned && (
                  <Pin className="size-3 rotate-45 fill-amber-500 text-amber-600" />
                )}
              </div>
            </div>

            {/* Body: Read-only Title/Summary */}
            <div className="w-full flex-1 px-2.5 py-2 overflow-y-auto scrollbar-none text-left z-10">
              <p className="text-xs sm:text-sm font-medium text-foreground leading-snug break-words select-text">
                {note.text}
              </p>
            </div>

            {/* Footer: Assignee + Status / Points Badge */}
            <div className="w-full h-8 px-2.5 pb-0.5 flex items-center justify-between border-t border-border/40 shrink-0 z-10">
              {/* Left: Assignee / Author */}
              <div
                className="flex items-center gap-1.5 min-w-0 max-w-[85px] pointer-events-none"
                title={note.authorName}
              >
                <div className="size-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                  {note.authorName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-[11px] text-muted-foreground truncate font-medium">
                  {note.authorName}
                </span>
              </div>

              {/* Right: Lifecycle / Points Badge */}
              <div className="shrink-0">
                {isEstimating ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#E31C79]/15 text-[#E31C79] border border-[#E31C79]/30 animate-pulse">
                    <Play className="size-2.5 fill-current" />
                    <span>{t('room.stickyNote.estimatingStatus')}</span>
                  </span>
                ) : hasStoryPoints ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs">
                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{note.storyPoints} pts</span>
                  </span>
                ) : isFacilitator ? (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={handleEstimateAction}
                    title={t('room.stickyNote.estimateThisStory')}
                    className="nodrag h-6 px-2 rounded-md flex items-center gap-1 bg-[#E31C79] hover:bg-[#CC196C] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="size-2.5 fill-current" />
                    <span>{t('room.startEstimate')}</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded text-muted-foreground/70 bg-muted/60">
                    {t('room.stickyNote.pendingStatus')}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ─── BRANCH 2: GENERAL FREEFORM STICKY NOTE (EDITABLE) ─── */
          <>
            {/* Header: Pin Indicator */}
            <div className="w-full h-6 px-2.5 pt-1.5 flex items-center justify-end shrink-0 z-10">
              {note.isPinned && <Pin className="size-3 rotate-45 fill-amber-500 text-amber-600" />}
            </div>

            {/* Body: Editable Textarea */}
            <div className="w-full flex-1 px-2.5 py-1 z-10">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={isLockedByOther}
                placeholder={isFocused ? '' : t('room.stickyNote.placeholder')}
                className={cn(
                  'nodrag w-full h-full resize-none bg-transparent outline-none border-none p-0 tracking-normal scrollbar-none text-left font-sans text-xs sm:text-sm font-normal text-foreground leading-snug',
                  isLockedByOther ? 'cursor-not-allowed opacity-60' : 'cursor-text',
                )}
                rows={4}
              />
            </div>

            {/* Footer: Author Name & Quick Actions */}
            <div className="w-full h-8 px-2.5 pb-0.5 flex items-center justify-between border-t border-border/40 shrink-0 z-10 text-[11px] text-muted-foreground">
              <span className="truncate max-w-[80px] pointer-events-none">{note.authorName}</span>
              <div className="shrink-0">
                {isEstimating ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-[#E31C79]/15 text-[#E31C79] border border-[#E31C79]/30 animate-pulse">
                    <Play className="size-2.5 fill-current" />
                    <span>{t('room.stickyNote.estimatingStatus')}</span>
                  </span>
                ) : hasStoryPoints ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs">
                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{note.storyPoints} pts</span>
                  </span>
                ) : isFacilitator && text.trim().length > 0 ? (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={handleEstimateAction}
                    title={t('room.stickyNote.estimateThisStory')}
                    className="nodrag h-6 px-2 rounded-md flex items-center gap-1 bg-[#E31C79] hover:bg-[#CC196C] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="size-2.5 fill-current" />
                    <span>{t('room.startEstimate')}</span>
                  </button>
                ) : (
                  <span className="text-[10px] opacity-50 select-none">
                    {text.length > 0 ? `${text.length}` : ''}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4-Corner Selection Indicators when selected */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 size-2 rounded-full bg-white border-2 border-primary pointer-events-none z-30" />
          <div className="absolute -top-1 -right-1 size-2 rounded-full bg-white border-2 border-primary pointer-events-none z-30" />
          <div className="absolute -bottom-1 -left-1 size-2 rounded-full bg-white border-2 border-primary pointer-events-none z-30" />
          <div className="absolute -bottom-1 -right-1 size-2 rounded-full bg-white border-2 border-primary pointer-events-none z-30" />
        </>
      )}
    </div>
  );
}
