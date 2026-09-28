import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Search,
  X,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { SPRING_PANEL } from '@/lib/ease';
import { SharedLayoutBg } from '@/components/motion/shared-layout-bg';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeJiraUrl } from '../../utils/jira-url-helper';
import type { RoomProjection } from '../../types/room.types';
import { useActiveRoom } from '../../hooks/use-active-room';
import { useRoomStore } from '../../context/room-store-context';

export interface BacklogStoryItem {
  id: string;
  key: string;
  summary: string;
  issueType: string;
  jiraUrl: string;
  storyPoints: number | string | null;
}

export interface StoryBacklogDrawerProps {
  room?: RoomProjection;
  isFacilitator?: boolean;
  onEstimateStory?: (jiraKey: string, summary: string) => void;
}

export function StoryBacklogDrawer(props: StoryBacklogDrawerProps) {
  const { t } = useTranslation('room');
  const active = useActiveRoom();
  const room = props.room || active.room;
  const isFacilitator =
    props.isFacilitator !== undefined ? props.isFacilitator : active.isFacilitator;
  const estimateStory = useRoomStore((s) => s.estimateStory);
  const onEstimateStory = props.onEstimateStory || estimateStory;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);

  if (!room) return null;

  // Extract all User Stories from room (from stickyNotes, storyBacklog, or currentRound)
  const stories: BacklogStoryItem[] = useMemo(() => {
    type NoteItem = NonNullable<typeof room.stickyNotes>[0];
    const isJiraStoryNote = (n: NoteItem) =>
      Boolean(n.jiraKey || n.text?.trim().match(/^[A-Z][A-Z0-9]+-\d+/i));

    // 1. Check stickyNotes with jiraKey or matching key in text
    const fromSticky = (room.stickyNotes || []).filter(isJiraStoryNote).map((note) => {
      const textKeyMatch = note.text?.trim().match(/^([A-Z][A-Z0-9]+-\d+)[:\s-]*(.*)/i);
      const key = note.jiraKey || textKeyMatch?.[1]?.toUpperCase() || 'STORY';
      const rawText = note.text?.trim() || '';
      const cleanSummary =
        rawText.replace(new RegExp(`^(?:${key}[:\\s-]*)+`, 'i'), '').trim() ||
        textKeyMatch?.[2]?.trim() ||
        rawText;

      return {
        id: note.id,
        key,
        summary: cleanSummary,
        issueType: note.issueType || 'Story',
        jiraUrl: note.jiraUrl || '',
        storyPoints: note.storyPoints ?? null,
      };
    });

    if (fromSticky.length > 0) return fromSticky;

    // 2. Check room.storyBacklog
    if (room.storyBacklog && room.storyBacklog.length > 0) {
      return room.storyBacklog.map((item) => {
        const cleanSummary =
          (item.summary || '').replace(new RegExp(`^(?:${item.key}[:\\s-]*)+`, 'i'), '').trim() ||
          item.summary;
        return {
          id: item.id,
          key: item.key,
          summary: cleanSummary,
          issueType: item.issueType || 'Story',
          jiraUrl: item.jiraUrl || '',
          storyPoints: item.estimatedStoryPoints ?? null,
        };
      });
    }

    // 3. Check currentRound.linkedJiraIssue
    if (room.currentRound?.linkedJiraIssue) {
      const issue = room.currentRound.linkedJiraIssue;
      const cleanSummary =
        (issue.summary || '').replace(new RegExp(`^(?:${issue.key}[:\\s-]*)+`, 'i'), '').trim() ||
        issue.summary;
      return [
        {
          id: issue.id || 'current-story',
          key: issue.key,
          summary: cleanSummary,
          issueType: 'Story',
          jiraUrl: issue.url || '',
          storyPoints: issue.currentStoryPoints ?? null,
        },
      ];
    }

    return [];
  }, [room.stickyNotes, room.storyBacklog, room.currentRound?.linkedJiraIssue]);

  // Determine current active story key
  const activeJiraKey = useMemo(() => {
    if (room.currentRound?.linkedJiraIssue?.key) {
      return room.currentRound.linkedJiraIssue.key.toUpperCase();
    }
    const match = room.currentRound?.topic?.match(/([A-Z][A-Z0-9]+-\d+)/i);
    if (match?.[1]) {
      return match[1].toUpperCase();
    }
    return stories[0]?.key?.toUpperCase() || null;
  }, [room.currentRound, stories]);

  // Filter stories by search query
  const filteredStories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return stories;
    return stories.filter(
      (s) => s.key.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q),
    );
  }, [stories, searchQuery]);

  // Estimated stats
  const estimatedCount = useMemo(() => {
    return stories.filter((s) => s.storyPoints !== null && s.storyPoints !== undefined).length;
  }, [stories]);

  const progressPercent =
    stories.length > 0 ? Math.round((estimatedCount / stories.length) * 100) : 0;

  // Global hotkey 'B' to toggle drawer (guarded against active input elements)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        const target = e.target as HTMLElement | null;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target?.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close when clicking outside drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handler to estimate a story
  const handleEstimate = useCallback(
    (story: BacklogStoryItem) => {
      if (!isFacilitator || !onEstimateStory) return;
      onEstimateStory(story.key, story.summary);
    },
    [isFacilitator, onEstimateStory],
  );

  return (
    <>
      {/* ── Left Floating Tab Trigger (Visible ONLY when drawer is closed to prevent detached floating bugs) ── */}
      <div
        className={cn(
          'fixed left-0 top-20 z-30 transition-all duration-200 pointer-events-none',
          isOpen ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100',
        )}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title={t('room.backlog.toggleOpen')}
          className="pointer-events-auto group flex items-center gap-2 px-3 py-2 rounded-r-md border border-l-0 border-border bg-card dark:bg-[#0B1B3D] text-foreground shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-150 cursor-pointer"
        >
          <Layers className="size-4 text-primary transition-transform group-hover:scale-110" />
          <span className="text-xs font-mono font-bold tracking-tight text-foreground">
            {stories.length > 0 ? `${estimatedCount}/${stories.length}` : '0'}
          </span>
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Story</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-medium rounded-sm bg-muted text-muted-foreground border border-border">
            B
          </kbd>
          <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* ── Floating Left Backlog Drawer (ONE Command Console standard: full-height, crisp borders, 8px radius) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={drawerRef}
            key="story-backlog-drawer"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={SPRING_PANEL}
            className="fixed left-0 inset-y-0 z-40 w-96 max-w-[calc(100vw-1rem)] flex flex-col bg-card dark:bg-[#0B1B3D] border-r border-border shadow-2xl select-none"
          >
            {/* The Container Frame: 3px ONE Magenta Accent Line at top */}
            <div className="h-[3px] w-full bg-[#E31C79] shrink-0" />

            {/* ── Drawer Header (ONE Brand: Structured, High-contrast, Disciplined density) ── */}
            <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/30 shrink-0 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Layers className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                      {room.activeJiraSprintName || t('room.backlog.title')}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {t('room.backlog.sprintTitle')} · {stories.length} User Stories
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Progress Pill */}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm font-mono text-[11px] font-semibold bg-background border border-border text-foreground">
                    {progressPercent}%
                  </span>

                  {/* Collapse Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                    title={t('room.backlog.toggleClose')}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Micro Bar */}
              <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-[#E31C79] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Search Filter (38px standard input height per DESIGN.md section 12) */}
              {stories.length > 3 && (
                <div className="relative mt-1">
                  <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('room.backlog.searchPlaceholder')}
                    className="h-[34px] pl-8.5 pr-7 text-xs bg-background border-border/90 rounded-md focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Stories List with beUI SharedLayoutBg (Clean, Neutral Surface Primacy) ── */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-border">
              {filteredStories.length === 0 ? (
                <div className="py-16 px-4 text-center">
                  <Layers className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">
                    {t('room.backlog.empty')}
                  </p>
                </div>
              ) : (
                <SharedLayoutBg
                  as="div"
                  className="flex flex-col gap-2"
                  contentClassName="w-full"
                  selectedKey={activeJiraKey}
                  pillClassName="rounded-lg bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80"
                >
                  {filteredStories.map((story) => {
                    const isStoryActive = activeJiraKey?.toUpperCase() === story.key.toUpperCase();
                    const hasStoryPoints =
                      story.storyPoints !== null && story.storyPoints !== undefined;

                    return (
                      <div
                        key={story.key}
                        onClick={() => {
                          if (isFacilitator && !isStoryActive) {
                            handleEstimate(story);
                          }
                        }}
                        className={cn(
                          'group relative w-full p-3.5 rounded-lg border transition-all duration-150 select-none text-left',
                          isFacilitator && !isStoryActive && 'cursor-pointer',
                          isStoryActive
                            ? 'card-container-frame bg-[#FDF2F7]/70 dark:bg-[#E31C79]/10 border-primary/40 shadow-xs'
                            : 'bg-card/90 dark:bg-[#0E1F44]/90 border-border/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-none',
                        )}
                      >
                        {/* Header: Jira Key + Issue Type Badge + Status/Points Badge */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {/* Jira Key: JetBrains Mono Variable per ADR 0035 */}
                            <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 tracking-tight">
                              {story.key}
                            </span>
                            {(() => {
                              const targetUrl = normalizeJiraUrl(
                                story.jiraUrl,
                                room.activeJiraSiteUrl,
                                story.key,
                              );
                              return (
                                <a
                                  href={targetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  title={t('room.backlog.openInJira')}
                                  className="text-muted-foreground hover:text-[#CC196C] transition-colors"
                                >
                                  <ExternalLink className="size-3" />
                                </a>
                              );
                            })()}
                            {/* Issue Type Badge: 11px font-mono, 4px industrial radius */}
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm font-mono text-[11px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {story.issueType}
                            </span>
                          </div>

                          {/* Right Status Badge */}
                          <div className="shrink-0 flex items-center gap-1">
                            {hasStoryPoints ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-sm gap-1 shadow-none">
                                <CheckCircle2 className="size-3" />
                                {story.storyPoints} pts
                              </Badge>
                            ) : isStoryActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-[#FDF2F7] text-[#CC196C] dark:bg-primary/20 dark:text-pink-300 border border-[#E31C79]/30 animate-pulse">
                                <Sparkles className="size-3" />
                                {t('room.backlog.activeBadge')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[11px] font-normal text-muted-foreground bg-slate-100/60 dark:bg-slate-800/60 border border-border/80">
                                <Clock className="size-3" />
                                {t('room.backlog.pendingBadge')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Story Summary / Title: Inter Variable, 14px, leading-snug */}
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug mb-2.5">
                          {story.summary}
                        </p>

                        {/* Facilitator Action Bar: Disciplined Density & High-contrast hover */}
                        {isFacilitator && (
                          <div className="flex items-center justify-end pt-2 border-t border-border/40">
                            {isStoryActive ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEstimate(story)}
                                className="h-7 px-2.5 text-xs font-medium gap-1 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md"
                              >
                                <RotateCcw className="size-3" />
                                <span>{t('room.backlog.reEstimateAction')}</span>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEstimate(story)}
                                className="h-7 px-2.5 text-xs font-medium gap-1 border-border text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:text-primary hover:bg-primary/5 rounded-md shadow-none"
                              >
                                <Play className="size-3 text-primary" />
                                <span>{t('room.backlog.estimateAction')}</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </SharedLayoutBg>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
