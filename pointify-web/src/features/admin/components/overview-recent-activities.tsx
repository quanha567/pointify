import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2Icon, CheckCircle2Icon, UsersIcon, ClipboardListIcon } from 'lucide-react';
import type { RecentActivityItem } from '../types/admin-overview.types';

interface OverviewRecentActivitiesProps {
  activities?: RecentActivityItem[];
}

export function OverviewRecentActivities({ activities: _ }: OverviewRecentActivitiesProps) {
  const { t } = useTranslation('admin');

  const mockActivities = [
    {
      id: 'act-1',
      user: 'Nguyen Minh',
      action: t('admin.overview.activities.createdGame'),
      target: 'Sprint 32 - Feature Update',
      time: t('admin.overview.activities.m_ago', { count: 30, defaultValue: '30m ago' }),
      icon: Gamepad2Icon,
      iconBg: 'bg-primary/10 text-primary',
    },
    {
      id: 'act-2',
      user: 'Tran Ha',
      action: t('admin.overview.activities.completedVoting'),
      target: 'Sprint 31 - Bug Fixes',
      time: t('admin.overview.activities.h_ago', { count: 1, defaultValue: '1h ago' }),
      icon: CheckCircle2Icon,
      iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300',
    },
    {
      id: 'act-3',
      user: 'Le Kim',
      action: t('admin.overview.activities.joinedRoom'),
      target: 'Platform Team',
      time: t('admin.overview.activities.h_ago', { count: 2, defaultValue: '2h ago' }),
      icon: UsersIcon,
      iconBg: 'bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-300',
    },
    {
      id: 'act-4',
      user: 'Pham Anh',
      action: t('admin.overview.activities.updatedBacklog'),
      target: 'US-1024 - Improve login performance',
      time: t('admin.overview.activities.h_ago', { count: 3, defaultValue: '3h ago' }),
      icon: ClipboardListIcon,
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300',
    },
  ];

  return (
    <Card
      variant="container"
      className="rounded-lg border border-border bg-card shadow-xs flex flex-col justify-between h-full"
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground font-sans">
            {t('admin.overview.cards.recentActivity')}
          </CardTitle>
          <Link
            to="/admin/logs"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>{t('admin.overview.cards.viewAll')}</span>
            <span>→</span>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
        <div className="divide-y divide-border/30">
          {mockActivities.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2.5 hover:bg-muted/30 transition-colors px-1 rounded-md group cursor-pointer"
            >
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full shadow-2xs ${item.iconBg}`}
                >
                  <item.icon className="size-4" />
                </div>

                <div className="grid text-left leading-tight truncate">
                  <p className="text-xs text-foreground truncate">
                    <span className="font-semibold">{item.user}</span>{' '}
                    <span className="text-muted-foreground">{item.action}</span>
                  </p>
                  <span className="text-[11px] text-muted-foreground font-medium truncate">
                    {item.target}
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-muted-foreground/80 shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
