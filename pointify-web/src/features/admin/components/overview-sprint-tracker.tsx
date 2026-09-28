import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShipIcon, AnchorIcon, RadioIcon, CheckCircle2Icon } from 'lucide-react';

interface SprintItem {
  id: string;
  name: string;
  squad: string;
  estimated: number;
  total: number;
  status: 'active' | 'in_review' | 'planning' | 'completed';
  icon: React.ComponentType<{ className?: string }>;
}

const mockSprints: SprintItem[] = [
  {
    id: 'sprint-42',
    name: 'Sprint 42',
    squad: 'Vessel Tracking Squad',
    estimated: 18,
    total: 24,
    status: 'active',
    icon: ShipIcon,
  },
  {
    id: 'sprint-19',
    name: 'Sprint 19',
    squad: 'Port Booking Squad',
    estimated: 14,
    total: 16,
    status: 'in_review',
    icon: AnchorIcon,
  },
  {
    id: 'sprint-8',
    name: 'Sprint 8',
    squad: 'Cargo IoT Squad',
    estimated: 8,
    total: 18,
    status: 'planning',
    icon: RadioIcon,
  },
  {
    id: 'sprint-31',
    name: 'Sprint 31',
    squad: 'Ocean Billing Portal',
    estimated: 20,
    total: 20,
    status: 'completed',
    icon: CheckCircle2Icon,
  },
];

export function OverviewSprintTracker() {
  const { t } = useTranslation('admin');

  const getStatusBadge = (status: SprintItem['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge
            variant="default"
            className="bg-primary text-primary-foreground text-xs font-medium rounded-sm"
          >
            Active
          </Badge>
        );
      case 'in_review':
        return (
          <Badge
            variant="outline"
            className="border-chart-3/40 text-chart-3 text-xs font-medium rounded-sm"
          >
            Review
          </Badge>
        );
      case 'planning':
        return (
          <Badge
            variant="secondary"
            className="text-muted-foreground text-xs font-medium rounded-sm"
          >
            Planning
          </Badge>
        );
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-sm"
          >
            Done
          </Badge>
        );
    }
  };

  return (
    <Card className="flex flex-col rounded-lg border border-border/70 bg-card shadow-xs transition-shadow hover:shadow-sm">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">
              {t('admin.overview.sprintTracker.title')}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t('admin.overview.sprintTracker.subtitle')}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-normal rounded-sm">
            {mockSprints.length} Sprints
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 p-5 pt-0">
        {mockSprints.map((sprint) => {
          const Icon = sprint.icon;
          const percent = Math.round((sprint.estimated / sprint.total) * 100);

          return (
            <div
              key={sprint.id}
              className="group flex flex-col gap-2 rounded-md border border-border/80 p-3 transition-colors hover:bg-muted/40 hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="grid">
                    <span className="text-xs font-semibold text-foreground">
                      {sprint.name} • {sprint.squad}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t('admin.overview.sprintTracker.storiesEstimated', {
                        estimated: sprint.estimated,
                        total: sprint.total,
                      })}
                    </span>
                  </div>
                </div>
                {getStatusBadge(sprint.status)}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Sprint Readiness</span>
                  <span className="font-semibold text-foreground">{percent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percent === 100 ? 'bg-emerald-500' : 'bg-primary'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
