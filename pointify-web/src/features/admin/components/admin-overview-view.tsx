import { useAdminOverviewQuery } from '../api/use-admin-overview';
import { OverviewHeroBanner } from './overview-hero-banner';
import { OverviewMetricCards } from './overview-metric-cards';
import { OverviewRecentGames } from './overview-recent-games';
import { OverviewMyTeam } from './overview-my-team';
import { OverviewBetterTogetherCard } from './overview-better-together-card';
import { OverviewRecentActivities } from './overview-recent-activities';
import { OverviewDeckChart } from './overview-deck-chart';
import { OverviewQuickActions } from './overview-quick-actions';
import { AdminOverviewSkeleton } from './admin-overview-skeleton';
import { AdminOverviewError } from './admin-overview-error';
import type { AdminOverviewSearchParams } from '../types/admin-overview.types';

export interface AdminOverviewViewProps {
  searchParams: AdminOverviewSearchParams;
  onNavigateSearch: (
    updater: (prev: AdminOverviewSearchParams) => AdminOverviewSearchParams,
  ) => void;
}

export function AdminOverviewView({ searchParams }: AdminOverviewViewProps) {
  const currentRange = searchParams.range || '30d';

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminOverviewQuery(currentRange);

  if (isLoading) {
    return <AdminOverviewSkeleton />;
  }

  if (isError || !response?.summary) {
    return <AdminOverviewError error={error as Error} reset={() => void refetch()} />;
  }

  const { summary } = response;

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Hero Greeting Banner – Full Bleed */}
      <OverviewHeroBanner />

      {/* Main Content Grid – Clean responsive padding */}
      <div className="flex flex-col space-y-5 px-4 sm:px-6 lg:px-7 pt-5">
        {/* Row 1: 4 Metric Cards */}
        <OverviewMetricCards summary={summary} />

        {/* Row 2: Recent Games (50%) + My Team (25%) + ONE Better Together Card (25%) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col">
            <OverviewRecentGames />
          </div>
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col">
            <OverviewMyTeam />
          </div>
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col">
            <OverviewBetterTogetherCard />
          </div>
        </div>

        {/* Row 3: Recent Activity (33%) + Game Distribution (42%) + Quick Actions (25%) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
            <OverviewRecentActivities />
          </div>
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
            <OverviewDeckChart />
          </div>
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col">
            <OverviewQuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
