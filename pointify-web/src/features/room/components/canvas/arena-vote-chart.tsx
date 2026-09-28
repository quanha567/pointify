import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { useTheme } from 'next-themes';

export interface ArenaVoteChartProps {
  distribution: Record<string, number>;
  totalVoters: number;
  consensusValue: string | null;
  hasConsensus: boolean;
}

export default function ArenaVoteChart({
  distribution,
  totalVoters,
  consensusValue,
  hasConsensus,
}: ArenaVoteChartProps) {
  const { t } = useTranslation('room');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Strict ONE Design Guideline Color Palette (100% SVG Presentation Attribute Compatible)
  const palette = useMemo(
    () => ({
      primary: '#E31C79', // ONE Cherry Blossom Magenta (Pantone 213 C)
      consensus: '#059669', // Emerald 600 (High consensus)
      neutralBar: isDark ? '#475569' : '#CBD5E1', // Slate 600 (dark) / Slate 300 (light)
      track: isDark ? '#1E293B' : '#E2E8F0', // Slate 800 (dark) / Slate 200 (light border.subtle)
      textPrimary: isDark ? '#F8FAFC' : '#0F172A', // Slate 50 / Slate 900
      textSecondary: isDark ? '#94A3B8' : '#64748B', // Slate 400 / Slate 500
    }),
    [isDark],
  );

  const items = useMemo(() => {
    const entries = Object.entries(distribution);
    if (entries.length === 0) return [];
    const maxEntriesCount = Math.max(...entries.map(([, c]) => c));

    return entries
      .map(([value, count]) => {
        const numVal = value === '½' ? 0.5 : Number(value);
        const percent = totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0;
        const isConsensusCard = hasConsensus && consensusValue === value;
        const isTopVote = isConsensusCard || (!hasConsensus && count === maxEntriesCount);

        let fill = palette.neutralBar;
        if (isConsensusCard) {
          fill = palette.consensus;
        } else if (isTopVote) {
          fill = palette.primary;
        }

        return {
          value,
          numVal: isNaN(numVal) ? 9999 : numVal,
          count,
          percent,
          percentLabel: `${count} (${percent}%)`,
          fill,
          isConsensusCard,
          isTopVote,
        };
      })
      .sort((a, b) => b.count - a.count || a.numVal - b.numVal);
  }, [distribution, totalVoters, hasConsensus, consensusValue, palette]);

  const chartHeight = useMemo(() => {
    return Math.min(110, Math.max(36, items.length * 24 + 10));
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-[480px] rounded-lg bg-slate-50/80 dark:bg-slate-900/60 border border-border p-3 shadow-xs select-none">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <BarChart3 className="size-3.5" />
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
            {t('room.voteDistribution')}
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground font-medium">
          {totalVoters} {t('room.votes')}
        </span>
      </div>

      <div style={{ height: chartHeight, width: '100%' }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 456, height: chartHeight }}
        >
          <BarChart
            layout="vertical"
            data={items}
            margin={{ top: 2, right: 65, left: -6, bottom: 2 }}
            barSize={12}
          >
            <XAxis type="number" domain={[0, totalVoters || 1]} hide />
            <YAxis
              type="category"
              dataKey="value"
              tickLine={false}
              axisLine={false}
              width={28}
              tick={{
                fontSize: 12,
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                fill: palette.textPrimary,
              }}
            />
            <Tooltip
              cursor={{
                fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                radius: 4,
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as (typeof items)[0];
                return (
                  <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 shadow-xs text-popover-foreground text-center">
                    <div className="font-mono text-xs font-bold text-foreground">{item.value}</div>
                    <div className="font-mono text-[11px] text-muted-foreground mt-0.5">
                      {item.count} {t('room.votes')} ({item.percent}%)
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              background={{ fill: palette.track, radius: 4 }}
              isAnimationActive={true}
              animationDuration={250}
              animationEasing="ease-out"
            >
              <LabelList
                dataKey="percentLabel"
                position="right"
                offset={8}
                className="font-mono text-[11px] font-semibold"
                fill={palette.textSecondary}
              />
              {items.map((entry) => (
                <Cell key={`cell-${entry.value}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
