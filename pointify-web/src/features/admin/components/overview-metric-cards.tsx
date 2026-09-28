import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { motion, useReducedMotion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { DoorOpenIcon, Gamepad2Icon, RotateCcwIcon, UsersIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/motion/animated-number';
import { EASE_OUT } from '@/lib/ease';

interface OverviewMetricCardsProps {
  summary?: {
    totalRounds?: number;
    activeRooms?: number;
    activeAccounts?: number;
  };
}

interface MetricSparklineProps {
  data: number[];
  id: string;
}

/** Animated sparkline area chart powered by Recharts */
function MetricSparkline({ data, id }: MetricSparklineProps) {
  const chartData = useMemo(() => data.map((val, idx) => ({ index: idx, val })), [data]);

  return (
    <div className="h-10 w-24 sm:w-28 shrink-0 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 3, right: 1, bottom: 0, left: 1 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="val"
            stroke="var(--primary)"
            strokeWidth={2.4}
            fill={`url(#spark-${id})`}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OverviewMetricCards({ summary }: OverviewMetricCardsProps) {
  const { t } = useTranslation('admin');
  const reduceMotion = useReducedMotion();

  const totalGamesVal = summary?.totalRounds ?? 24;
  const activeRoomsVal = summary?.activeRooms ?? 6;
  const teamMembersVal = summary?.activeAccounts ?? 18;
  const avgCycleVal = 2.3;

  const metrics = [
    {
      id: 'games',
      title: t('admin.overview.cards.totalGames'),
      numericValue: totalGamesVal,
      decimals: 0,
      suffix: '',
      growth: '12%',
      growthLabel: t('admin.overview.cards.vsLastMonth'),
      icon: Gamepad2Icon,
      sparkData: [10, 13, 12, 16, 15, 19, 21, 24],
    },
    {
      id: 'rooms',
      title: t('admin.overview.cards.activeRooms'),
      numericValue: activeRoomsVal,
      decimals: 0,
      suffix: '',
      growth: '2',
      growthLabel: t('admin.overview.cards.vsLastWeek'),
      icon: DoorOpenIcon,
      sparkData: [2, 3, 2, 4, 3, 5, 4, 6],
    },
    {
      id: 'team',
      title: t('admin.overview.cards.teamMembers'),
      numericValue: teamMembersVal,
      decimals: 0,
      suffix: '',
      growth: '3',
      growthLabel: t('admin.overview.cards.vsLastMonth'),
      icon: UsersIcon,
      sparkData: [10, 12, 11, 14, 13, 16, 17, 18],
    },
    {
      id: 'cycle',
      title: t('admin.overview.cards.avgCycleTime'),
      numericValue: avgCycleVal,
      decimals: 1,
      suffix: ` ${t('admin.overview.cards.days')}`,
      growth: '18%',
      growthLabel: t('admin.overview.cards.vsLastMonth'),
      icon: RotateCcwIcon,
      sparkData: [1.2, 1.4, 1.3, 1.7, 1.6, 1.9, 2.1, 2.3],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion ? { duration: 0.1 } : { duration: 0.18, ease: EASE_OUT, delay: idx * 0.04 }
          }
        >
          <Card
            variant="container"
            className="card-container-frame relative overflow-hidden rounded-lg border border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md group h-full"
          >
            <CardContent className="p-5">
              {/* Top row: Pink badge icon + Title */}
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
                  <item.icon className="size-5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground/80 dark:text-muted-foreground line-clamp-1 font-sans">
                  {item.title}
                </span>
              </div>

              {/* Middle row: Big Bold Animated Value (Mono) + Animated Recharts Sparkline */}
              <div className="mt-3.5 flex items-end justify-between gap-2">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  <AnimatedNumber
                    value={item.numericValue}
                    duration={0.8}
                    format={(n) => {
                      const formatted =
                        item.decimals > 0 ? n.toFixed(item.decimals) : Math.round(n).toString();
                      return `${formatted}${item.suffix}`;
                    }}
                  />
                </span>
                <MetricSparkline data={item.sparkData} id={item.id} />
              </div>

              {/* Bottom row: Trend indicator (Micro Caption) */}
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] sm:text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  ↑ {item.growth}
                </span>
                <span className="text-muted-foreground font-medium">{item.growthLabel}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
