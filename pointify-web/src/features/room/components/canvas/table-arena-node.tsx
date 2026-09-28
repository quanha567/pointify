import { memo, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import type { RoomProjection } from '../../types/room.types';
import { AnimatedNumber } from '@/components/motion/animated-number';
import { normalizeJiraUrl } from '../../utils/jira-url-helper';
import { EASE_OUT } from '@/lib/ease';
import { ArenaTopicCard, ArenaStoryHeadline, type ArenaTopicCardStory } from './arena-topic-card';
import { ArenaActiveTimer } from './arena-active-timer';

// Lazy-load Recharts component to avoid pulling large chart library into initial canvas bundle
const ArenaVoteChart = lazy(() => import('./arena-vote-chart'));

interface TableArenaNodeProps {
  data: {
    room?: RoomProjection;
  };
}

export const TableArenaNode = memo(function TableArenaNode({ data }: TableArenaNodeProps) {
  if (!data.room) return null;

  const room = data.room;
  const { t } = useTranslation('room');

  const currentRound = room.currentRound;
  const participants = room.participants;
  const isRevealed = currentRound.status === 'revealed' || currentRound.status === 'completed';

  const totalEstimators = participants.filter((p) => !p.isSpectator);
  const votedCount = totalEstimators.filter((p) => p.hasEstimated).length;
  const stats = currentRound.statistics;

  const consensusValue = useMemo(() => {
    if (!stats?.distribution) return null;
    const entries = Object.entries(stats.distribution);
    if (entries.length === 0) return null;
    const sorted = entries.sort(([, a], [, b]) => b - a);
    return sorted[0]?.[0] ?? null;
  }, [stats?.distribution]);

  const displayAverage = useMemo(() => {
    if (stats?.average !== null && stats?.average !== undefined) {
      return stats.average;
    }
    if (stats?.distribution) {
      const numericEntries: { val: number; count: number }[] = [];
      for (const [key, cnt] of Object.entries(stats.distribution)) {
        const num = key === '½' ? 0.5 : Number(key);
        if (!isNaN(num) && isFinite(num) && key !== '?' && key !== '☕') {
          numericEntries.push({ val: num, count: cnt });
        }
      }
      if (numericEntries.length > 0) {
        const total = numericEntries.reduce((acc, curr) => acc + curr.val * curr.count, 0);
        const totalCount = numericEntries.reduce((acc, curr) => acc + curr.count, 0);
        return totalCount > 0 ? Math.round((total / totalCount) * 10) / 10 : null;
      }
    }
    return null;
  }, [stats?.average, stats?.distribution]);

  const hasConsensus = Boolean(
    stats?.consensus ||
    (stats?.distribution &&
      consensusValue !== null &&
      consensusValue !== '?' &&
      consensusValue !== '☕' &&
      Object.keys(stats.distribution).length === 1),
  );

  const displayAgreementScore = useMemo(() => {
    if (stats?.agreementScore !== null && stats?.agreementScore !== undefined) {
      return stats.agreementScore;
    }
    if (stats?.distribution && votedCount > 0) {
      const maxVotes = Math.max(...Object.values(stats.distribution));
      return Math.round((maxVotes / votedCount) * 100);
    }
    return null;
  }, [stats?.agreementScore, stats?.distribution, votedCount]);

  const activeStoryData: ArenaTopicCardStory = useMemo(() => {
    const rawTopic = currentRound.topic?.trim() || '';
    const keyMatch = rawTopic.match(/^([A-Z][A-Z0-9]+-\d+)[:\s-]*/i);
    const jiraKey = currentRound.linkedJiraIssue?.key || keyMatch?.[1]?.toUpperCase();

    let cleanSummary = rawTopic;
    if (jiraKey) {
      cleanSummary = rawTopic.replace(new RegExp(`^(?:${jiraKey}[:\\s-]*)+`, 'i'), '').trim();
    }
    if (!cleanSummary && currentRound.linkedJiraIssue?.summary) {
      cleanSummary = currentRound.linkedJiraIssue.summary
        .replace(new RegExp(`^(?:${jiraKey}[:\\s-]*)+`, 'i'), '')
        .trim();
    }

    const backlogMatch = jiraKey
      ? (room?.storyBacklog || []).find((b) => b.key.toUpperCase() === jiraKey)
      : undefined;
    const noteMatch = jiraKey
      ? (room?.stickyNotes || []).find((n) => n.jiraKey?.toUpperCase() === jiraKey)
      : undefined;

    if (!cleanSummary && backlogMatch?.summary) {
      cleanSummary = backlogMatch.summary;
    }

    const summary = cleanSummary || t('room.defaultTopic');

    if (!jiraKey) {
      return {
        isJira: false,
        key: '',
        summary,
        jiraUrl: '',
        issueType: 'Story',
        priority: 'Medium',
        status: '',
        description: null,
        assignee: null,
        storyPoints: null,
        sprintName: null,
      };
    }

    const rawJiraUrl =
      currentRound.linkedJiraIssue?.url || backlogMatch?.jiraUrl || noteMatch?.jiraUrl || '';

    const jiraUrl = normalizeJiraUrl(rawJiraUrl, room?.activeJiraSiteUrl, jiraKey);

    const issueType =
      currentRound.linkedJiraIssue?.issueType ||
      backlogMatch?.issueType ||
      noteMatch?.issueType ||
      'Story';

    const priority = currentRound.linkedJiraIssue?.priority || backlogMatch?.priority || 'Medium';

    const status = currentRound.linkedJiraIssue?.status || backlogMatch?.status || '';

    const description =
      currentRound.linkedJiraIssue?.description ?? backlogMatch?.description ?? null;

    const assignee = currentRound.linkedJiraIssue?.assignee ?? backlogMatch?.assignee ?? null;

    const storyPoints =
      currentRound.linkedJiraIssue?.currentStoryPoints ??
      backlogMatch?.estimatedStoryPoints ??
      noteMatch?.storyPoints ??
      null;

    const sprintName =
      currentRound.linkedJiraIssue?.sprintName ?? room?.activeJiraSprintName ?? null;

    return {
      isJira: true,
      key: jiraKey,
      summary,
      jiraUrl,
      issueType,
      priority,
      status,
      description,
      assignee,
      storyPoints,
      sprintName,
    };
  }, [
    currentRound.topic,
    currentRound.linkedJiraIssue,
    room?.storyBacklog,
    room?.stickyNotes,
    room?.activeJiraSprintName,
    room?.activeJiraSiteUrl,
    t,
  ]);

  return (
    <div className="w-[620px] min-h-[340px] select-none pointer-events-auto">
      {/* Container Frame with 3px ONE Cherry Blossom Magenta Top Accent */}
      <div
        className="w-full h-full min-h-[340px] rounded-lg border border-border bg-card text-card-foreground p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between shadow-xs transition-colors duration-200 pointer-events-auto"
        style={{
          borderTop: '3px solid #E31C79',
        }}
      >
        {/* Header Info */}
        <ArenaTopicCard
          roundNumber={currentRound.roundNumber}
          isRevealed={isRevealed}
          story={activeStoryData}
        />

        {/* Center Table Content */}
        <div className="my-3 flex-1 flex flex-col items-center justify-center relative z-10">
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              /* ── VOTING STATE: Topic + Progress Ring / Countdown Timer ── */
              <motion.div
                key="voting-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: EASE_OUT }}
                className="w-full flex flex-col items-center text-center space-y-3.5 py-1"
              >
                {/* Topic & Story Identity (Jira Chip + Priority Dot + Title) */}
                <ArenaStoryHeadline story={activeStoryData} size="default" />

                {/* Progress Ring / Countdown Timer */}
                <ArenaActiveTimer
                  timer={currentRound.timer}
                  isRevealed={isRevealed}
                  totalEstimators={totalEstimators.length}
                  votedCount={votedCount}
                />
              </motion.div>
            ) : (
              /* ── REVEALED STATE: Stats + Grouped Cards ── */
              <motion.div
                key="revealed-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className="w-full flex flex-col items-center space-y-3.5 py-1"
              >
                {/* User Story Topic in Revealed State */}
                <ArenaStoryHeadline story={activeStoryData} size="compact" />

                {/* Statistics Row: ONE Digital Design Guidelines */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-[480px]">
                  <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-900/60 border border-border flex flex-col items-center shadow-xs">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      {t('room.average')}
                    </span>
                    <span className="text-2xl font-mono font-bold text-foreground mt-0.5 tracking-tight">
                      {displayAverage !== null && displayAverage !== undefined ? (
                        <AnimatedNumber
                          value={displayAverage}
                          duration={0.6}
                          format={(n) => n.toFixed(1)}
                        />
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-900/60 border border-border flex flex-col items-center justify-center shadow-xs">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      {t('room.consensus')}
                    </span>
                    <span className="text-2xl font-mono font-bold mt-0.5 tracking-tight flex items-center justify-center gap-1.5">
                      {hasConsensus ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="size-4.5" />
                          100%
                        </span>
                      ) : displayAgreementScore !== null ? (
                        <span className="text-foreground">{displayAgreementScore}%</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-900/60 border border-border flex flex-col items-center shadow-xs">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      {t('room.totalVoters')}
                    </span>
                    <span className="text-2xl font-mono font-bold text-foreground mt-0.5 tracking-tight">
                      {votedCount}
                    </span>
                  </div>
                </div>

                {/* Lazy-loaded Vote Distribution Chart */}
                {stats?.distribution && (
                  <Suspense
                    fallback={
                      <div className="h-20 w-full max-w-[480px] flex items-center justify-center rounded-lg border border-border bg-muted/20 animate-pulse text-xs text-muted-foreground">
                        {t('room.loading')}
                      </div>
                    }
                  >
                    <ArenaVoteChart
                      distribution={stats.distribution}
                      totalVoters={votedCount}
                      consensusValue={consensusValue}
                      hasConsensus={hasConsensus}
                    />
                  </Suspense>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});
