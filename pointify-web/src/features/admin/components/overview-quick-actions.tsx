import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SparklesIcon,
  DoorOpenIcon,
  ListChecksIcon,
  BarChart3Icon,
  ChevronRightIcon,
} from 'lucide-react';

export function OverviewQuickActions() {
  const { t } = useTranslation('admin');

  const actions = [
    {
      title: t('admin.overview.actions.startGame'),
      desc: t('admin.overview.actions.startGameDesc'),
      url: '/admin/rooms',
      icon: SparklesIcon,
    },
    {
      title: t('admin.overview.actions.joinRoom'),
      desc: t('admin.overview.actions.joinRoomDesc'),
      url: '/admin/rooms',
      icon: DoorOpenIcon,
    },
    {
      title: t('admin.overview.actions.viewBacklog'),
      desc: t('admin.overview.actions.viewBacklogDesc'),
      url: '/admin/decks',
      icon: ListChecksIcon,
    },
    {
      title: t('admin.overview.actions.viewReports'),
      desc: t('admin.overview.actions.viewReportsDesc'),
      url: '/admin/logs',
      icon: BarChart3Icon,
    },
  ];

  return (
    <Card
      variant="container"
      className="rounded-lg border border-border bg-card shadow-xs flex flex-col justify-between h-full"
    >
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground font-sans">
          {t('admin.overview.cards.quickActions')}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-3 h-full">
          {actions.map((action) => (
            <Link
              key={action.url + action.title}
              to={action.url}
              className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/20 hover:bg-primary/5 hover:border-primary/40 transition-all group cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <action.icon className="size-4" />
                </div>
                <div className="grid text-left leading-tight truncate">
                  <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors font-sans">
                    {action.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {action.desc}
                  </span>
                </div>
              </div>

              <ChevronRightIcon className="size-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
