import {
  CenterMorphModal,
  CenterMorphModalContent,
  CenterMorphModalTrigger,
} from '@/components/motion/center-morph-modal';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  Bug,
  CheckSquare,
  ChevronDown,
  Equal,
  ExternalLink,
  Layers,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeJiraUrl } from '../../utils/jira-url-helper';
import { StoryDescriptionView } from './story-description-view';

export interface ActiveStoryData {
  key: string;
  summary: string;
  jiraUrl?: string;
  issueType?: string;
  priority?: string;
  status?: string;
  description?: string | null;
  assignee?: { displayName: string; avatarUrl?: string } | null;
  storyPoints?: number | string | null;
  sprintName?: string | null;
}

interface ActiveStoryDetailModalProps {
  story: ActiveStoryData;
  children: ReactElement;
}

export function ActiveStoryDetailModal({ story, children }: ActiveStoryDetailModalProps) {
  const { t } = useTranslation('room');

  const getIssueTypeIcon = (type = 'Story') => {
    const lower = type.toLowerCase();
    if (lower.includes('bug')) return <Bug className="size-4 text-rose-500 shrink-0" />;
    if (lower.includes('task')) return <CheckSquare className="size-4 text-sky-500 shrink-0" />;
    if (lower.includes('improve')) return <Zap className="size-4 text-purple-500 shrink-0" />;
    return <Bookmark className="size-4 text-emerald-500 shrink-0" />;
  };

  const getPriorityIcon = (priority = 'Medium') => {
    const lower = priority.toLowerCase();
    if (lower.includes('highest')) {
      return <ArrowUp className="size-4 text-red-600 stroke-[2.5] shrink-0" />;
    }
    if (lower.includes('high')) {
      return <ArrowUp className="size-4 text-rose-500 stroke-[2] shrink-0" />;
    }
    if (lower.includes('low') || lower.includes('thấp')) {
      return <ArrowDown className="size-4 text-sky-500 stroke-[2] shrink-0" />;
    }
    if (lower.includes('lowest')) {
      return <ArrowDown className="size-4 text-slate-400 stroke-[2.5] shrink-0" />;
    }
    // Medium / Default
    return <Equal className="size-4 text-amber-500 stroke-[2.5] shrink-0" />;
  };

  const getStatusBadgeClass = (status = 'To Do') => {
    const lower = status.toLowerCase();
    if (lower.includes('done') || lower.includes('hoàn thành')) {
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    }
    if (lower.includes('progress') || lower.includes('đang làm')) {
      return 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30';
    }
    return 'bg-muted text-foreground border-border';
  };

  const targetJiraUrl = normalizeJiraUrl(story.jiraUrl, null, story.key);
  const isExternalJira = targetJiraUrl.startsWith('http');

  return (
    <CenterMorphModal>
      <CenterMorphModalTrigger>{children}</CenterMorphModalTrigger>
      <CenterMorphModalContent
        ariaLabel={t('jira.storyDetails')}
        className="w-full max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col border-t-[3px] border-t-primary bg-card text-card-foreground shadow-2xl rounded-lg overflow-hidden"
      >
        {/* Top Bar: Issue Type + Key pill + Actions */}
        <div className="p-5 sm:p-6 pb-3 border-b border-border flex items-center justify-between gap-3 pr-10 flex-wrap shrink-0">
          {/* Left: Breadcrumbs trail */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              {getIssueTypeIcon(story.issueType)}
              <span>{story.issueType || 'Story'}</span>
              <span className="text-border">/</span>
            </div>

            {/* Jira Issue Key Badge with Link */}
            <a
              href={targetJiraUrl}
              target={isExternalJira ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-xs font-semibold transition-colors',
                isExternalJira
                  ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 cursor-pointer'
                  : 'bg-muted text-muted-foreground cursor-default',
              )}
              title={t('jira.openInJira')}
            >
              <span>{story.key}</span>
              {isExternalJira && <ExternalLink className="size-3" />}
            </a>
          </div>
        </div>

        {/* Modal Body: 2 Columns on Desktop with Fixed / Sticky Details Panel */}
        <div className="p-5 sm:p-7 overflow-y-auto max-h-[calc(92vh-75px)] select-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9 items-start">
            {/* Left 8 Cols: Issue Summary & Formatted Description */}
            <div className="lg:col-span-8 space-y-5">
              {/* Summary / Title */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug font-heading">
                  {story.summary}
                </h2>
              </div>

              {/* Description View with Jira Rich Format */}
              <div className="pt-2">
                <StoryDescriptionView description={story.description} />
              </div>
            </div>

            {/* Right 4 Cols: Authentic Fixed / Sticky Jira "Details" Panel */}
            <div className="lg:col-span-4 lg:sticky lg:top-0 rounded-lg border border-border bg-muted/20 p-4 sm:p-5 space-y-3.5 shadow-sm">
              {/* Details Section Header */}
              <div className="flex items-center gap-1.5 pb-2.5 border-b border-border font-semibold text-sm text-foreground select-none">
                <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                <span>{t('jira.details', 'Details')}</span>
              </div>

              {/* Clean Horizontal Key-Value Rows */}
              <div className="space-y-3 pt-1">
                {/* 1. Assignee */}
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <span className="text-xs text-muted-foreground font-normal">
                    {t('jira.assignee')}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    {story.assignee?.avatarUrl ? (
                      <img
                        src={story.assignee.avatarUrl}
                        alt={story.assignee.displayName}
                        className="size-5 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="size-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                        <User className="size-3" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground truncate">
                      {story.assignee?.displayName || t('jira.unassigned')}
                    </span>
                  </div>
                </div>

                {/* 2. Story Points */}
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <span className="text-xs text-muted-foreground font-normal">
                    {t('jira.storyPoints')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-foreground px-2 py-0.5 rounded bg-muted border border-border inline-flex items-center gap-1">
                      <Sparkles className="size-3 text-primary" />
                      <span>
                        {story.storyPoints !== null && story.storyPoints !== undefined
                          ? `${story.storyPoints} pts`
                          : '—'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* 3. Status */}
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <span className="text-xs text-muted-foreground font-normal">
                    {t('jira.status')}
                  </span>
                  <div>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider border',
                        getStatusBadgeClass(story.status),
                      )}
                    >
                      {story.status || 'To Do'}
                    </span>
                  </div>
                </div>

                {/* 4. Priority */}
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <span className="text-xs text-muted-foreground font-normal">
                    {t('jira.priority')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getPriorityIcon(story.priority)}
                    <span className="text-sm font-medium text-foreground capitalize">
                      {story.priority || 'Medium'}
                    </span>
                  </div>
                </div>

                {/* 5. Sprint */}
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <span className="text-xs text-muted-foreground font-normal">
                    {t('jira.sprint')}
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Layers className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {story.sprintName || 'Active Sprint'}
                    </span>
                  </div>
                </div>

                {/* 6. Issue Type */}
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <span className="text-xs text-muted-foreground font-normal">
                    {t('jira.issueType')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getIssueTypeIcon(story.issueType)}
                    <span className="text-sm font-medium text-foreground">
                      {story.issueType || 'Story'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CenterMorphModalContent>
    </CenterMorphModal>
  );
}
