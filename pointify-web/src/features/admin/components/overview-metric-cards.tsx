import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';
import { UsersIcon, LayersIcon, CheckCircle2Icon, DicesIcon, TrendingUpIcon } from 'lucide-react';
import type { OverviewSummary } from '../types/admin-overview.types';

interface OverviewMetricCardsProps {
  summary: OverviewSummary;
}

export function OverviewMetricCards({ summary }: OverviewMetricCardsProps) {
  const { t } = useTranslation();

  const activeUserRatio = Math.round((summary.activeAccounts / (summary.totalAccounts || 1)) * 100);
  const avgRoundsPerRoom = (summary.totalRounds / (summary.totalRooms || 1)).toFixed(1);
  const avgEstimatesPerRound = Math.round(summary.totalEstimates / (summary.totalRounds || 1));

  const metrics = [
    {
      id: 'accounts',
      title: t('admin.overview.metrics.totalAccounts'),
      value: summary.totalAccounts.toLocaleString(),
      desc: t('admin.overview.metrics.activeAccountsDesc', {
        active: summary.activeAccounts,
        disabled: summary.disabledAccounts,
      }),
      badge: `${activeUserRatio}% hoạt động`,
      badgeVariant: 'secondary' as const,
      icon: UsersIcon,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'rooms',
      title: t('admin.overview.metrics.totalRooms'),
      value: summary.totalRooms.toLocaleString(),
      desc: t('admin.overview.metrics.activeRoomsDesc', {
        active: summary.activeRooms,
      }),
      badge: `${summary.activeRooms} hoạt động gần đây`,
      badgeVariant: 'outline' as const,
      icon: LayersIcon,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'rounds',
      title: t('admin.overview.metrics.totalRounds'),
      value: summary.totalRounds.toLocaleString(),
      desc: t('admin.overview.metrics.totalRoundsDesc'),
      badge: `~${avgRoundsPerRoom} vòng/phòng`,
      badgeVariant: 'secondary' as const,
      icon: CheckCircle2Icon,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'estimates',
      title: t('admin.overview.metrics.totalEstimates'),
      value: summary.totalEstimates.toLocaleString(),
      desc: t('admin.overview.metrics.totalEstimatesDesc'),
      badge: `~${avgEstimatesPerRound} lượt/vòng`,
      badgeVariant: 'outline' as const,
      icon: DicesIcon,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((item) => (
        <Card
          key={item.id}
          className="relative overflow-hidden border border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground line-clamp-1">
                {item.title}
              </span>
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}
              >
                <item.icon className="size-4" />
              </div>
            </div>

            <div className="mt-3">
              <Typography variant="large" className="text-2xl sm:text-3xl font-bold tracking-tight">
                {item.value}
              </Typography>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
              <span className="text-xs text-muted-foreground line-clamp-1">{item.desc}</span>
              <Badge
                variant={item.badgeVariant}
                className="shrink-0 text-xs px-2 py-0.5 font-medium"
              >
                <TrendingUpIcon className="mr-1 size-3" />
                {item.badge}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
