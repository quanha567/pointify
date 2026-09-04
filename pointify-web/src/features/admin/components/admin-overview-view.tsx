import { useTranslation } from 'react-i18next';
import { RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TypographyH2, TypographyMuted } from '@/components/ui/typography';
import { useAdminOverviewQuery } from '../api/use-admin-overview';
import { OverviewTimeRangePicker } from './overview-time-range-picker';
import { OverviewMetricCards } from './overview-metric-cards';
import { OverviewActivityChart } from './overview-activity-chart';
import { OverviewDeckChart } from './overview-deck-chart';
import { OverviewRecentActivities } from './overview-recent-activities';
import { AdminOverviewSkeleton } from './admin-overview-skeleton';
import { AdminOverviewError } from './admin-overview-error';
import type { AdminOverviewSearchParams, TimeRangePreset } from '../types/admin-overview.types';

export interface AdminOverviewViewProps {
  searchParams: AdminOverviewSearchParams;
  onNavigateSearch: (
    updater: (prev: AdminOverviewSearchParams) => AdminOverviewSearchParams,
  ) => void;
}

export function AdminOverviewView({ searchParams, onNavigateSearch }: AdminOverviewViewProps) {
  const { t } = useTranslation();
  const currentRange = searchParams.range || '30d';

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminOverviewQuery(currentRange);

  const handleRangeChange = (newRange: TimeRangePreset) => {
    onNavigateSearch((prev) => ({
      ...prev,
      range: newRange,
    }));
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success(t('admin.overview.refreshedToast'));
    } catch {
      toast.error(t('common.error', 'Không thể làm mới dữ liệu'));
    }
  };

  if (isLoading) {
    return <AdminOverviewSkeleton />;
  }

  if (isError || !response?.summary) {
    return <AdminOverviewError error={error as Error} reset={() => void refetch()} />;
  }

  const { summary, trends, deckDistribution, recentActivities } = response;

  return (
    <div className="flex flex-col space-y-5 pb-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <TypographyH2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t('admin.overview.title')}
          </TypographyH2>
          <TypographyMuted className="text-xs sm:text-sm text-muted-foreground leading-normal">
            {t('admin.overview.subtitle')}
          </TypographyMuted>
        </div>

        <div className="flex items-center gap-3">
          <OverviewTimeRangePicker
            value={currentRange}
            onChange={handleRangeChange}
            disabled={isFetching}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={isFetching}
            className="h-8.5 px-3 text-xs font-medium gap-1.5 rounded-lg border-border cursor-pointer shadow-2xs hover:bg-muted/60"
          >
            <RefreshCwIcon
              className={`size-3.5 text-muted-foreground ${
                isFetching ? 'animate-spin text-primary' : ''
              }`}
            />
            <span className="hidden sm:inline-block">
              {isFetching ? t('admin.overview.refreshing') : t('admin.overview.refresh')}
            </span>
          </Button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <OverviewMetricCards summary={summary} />

      {/* Charts Grid: 2 cols AreaChart + 1 col PieChart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewActivityChart data={trends} />
        </div>
        <div className="lg:col-span-1">
          <OverviewDeckChart data={deckDistribution} />
        </div>
      </div>

      {/* Bottom Section: Recent Activities Stream & Quick Navigation */}
      <OverviewRecentActivities activities={recentActivities} />
    </div>
  );
}
