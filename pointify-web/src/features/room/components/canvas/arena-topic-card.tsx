import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Bookmark, Bug, CheckSquare, Zap, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ActiveStoryDetailModal, type ActiveStoryData } from './active-story-detail-modal';
import { cn } from '@/lib/utils';

export interface ArenaTopicCardStory extends ActiveStoryData {
  isJira: boolean;
}

export type { ActiveStoryData };

interface ArenaTopicCardProps {
  roundNumber: number;
  isRevealed: boolean;
  story: ArenaTopicCardStory;
}

export const ArenaTopicCard = memo(function ArenaTopicCard({
  roundNumber,
  isRevealed,
  story,
}: ArenaTopicCardProps) {
  const { t } = useTranslation('room');

  const getIssueTypeIcon = (type = 'Story') => {
    const lower = type.toLowerCase();
    if (lower.includes('bug')) return <Bug className="size-3 text-rose-500 shrink-0" />;
    if (lower.includes('task')) return <CheckSquare className="size-3 text-sky-500 shrink-0" />;
    if (lower.includes('improve')) return <Zap className="size-3 text-purple-500 shrink-0" />;
    return <Bookmark className="size-3 text-emerald-500 shrink-0" />;
  };

  const getPriorityDot = (priority = 'Medium') => {
    const lower = priority.toLowerCase();
    let dotColor = 'bg-slate-400';
    if (lower.includes('highest') || lower.includes('high')) {
      dotColor = 'bg-rose-500';
    } else if (lower.includes('medium')) {
      dotColor = 'bg-amber-500';
    } else if (lower.includes('low')) {
      dotColor = 'bg-emerald-500';
    }

    return (
      <span className="h-6 px-2 rounded-sm bg-muted/40 border border-border/70 text-[11px] font-mono text-muted-foreground inline-flex items-center gap-1.5">
        <span className={cn('size-1.5 rounded-full shrink-0', dotColor)} />
        <span className="capitalize">{priority.toLowerCase()}</span>
      </span>
    );
  };

  return (
    <div className="flex items-center justify-between gap-3 relative z-10 pointer-events-auto w-full">
      {/* Left: Session Group (Round + Status) */}
      <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
        <span className="h-6 px-2.5 rounded-sm bg-muted/70 border border-border/80 text-xs font-mono font-bold text-foreground uppercase tracking-wider inline-flex items-center">
          {t('room.round')} {roundNumber}
        </span>

        <Badge
          variant="outline"
          className={cn(
            'h-6 px-2 rounded-sm text-[11px] font-mono tracking-wider uppercase font-semibold inline-flex items-center',
            isRevealed
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
          )}
        >
          {isRevealed ? t('room.statusRevealed') : t('room.statusVoting')}
        </Badge>
      </div>

      {/* Right: Story Identity Group (Jira Key + Priority + Story Details) */}
      {story.isJira && (
        <div className="flex items-center gap-1.5 flex-wrap justify-end pointer-events-auto">
          {/* Unified Jira Chip */}
          <a
            href={story.jiraUrl || '#'}
            target={story.jiraUrl ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={cn(
              'h-6 px-2 rounded-sm bg-muted/50 hover:bg-muted border border-border/70 text-xs font-mono font-medium inline-flex items-center gap-1.5 transition-colors group text-foreground',
              story.jiraUrl ? 'hover:border-primary/40 cursor-pointer' : 'cursor-default',
            )}
            title={t('jira.openInJira')}
          >
            {getIssueTypeIcon(story.issueType)}
            <span className="font-bold tracking-tight">{story.key}</span>
            {story.jiraUrl && (
              <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </a>

          {/* Priority Dot */}
          {story.priority && getPriorityDot(story.priority)}

          {/* Story Details Trigger */}
          <ActiveStoryDetailModal story={story}>
            <button
              type="button"
              className="nodrag nopan pointer-events-auto h-6 px-2 rounded-sm bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/70 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title={t('jira.viewStoryDetails')}
            >
              <FileText className="size-3 text-primary" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {t('jira.storyDetails')}
              </span>
            </button>
          </ActiveStoryDetailModal>
        </div>
      )}
    </div>
  );
});

interface ArenaStoryHeadlineProps {
  story: ArenaTopicCardStory;
  size?: 'default' | 'compact';
}

export const ArenaStoryHeadline = memo(function ArenaStoryHeadline({
  story,
  size = 'default',
}: ArenaStoryHeadlineProps) {
  return (
    <div className="max-w-[520px] w-full flex flex-col items-center px-2">
      {/* Story Summary Title */}
      <h2
        className={cn(
          'font-semibold tracking-tight text-foreground leading-snug text-center',
          size === 'compact'
            ? 'text-base sm:text-lg line-clamp-1'
            : 'text-lg sm:text-xl line-clamp-2',
        )}
      >
        {story.summary}
      </h2>
    </div>
  );
});
