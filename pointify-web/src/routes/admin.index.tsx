import { createFileRoute } from '@tanstack/react-router';
import {
  adminOverviewSearchSchema,
  type AdminOverviewSearchParams,
} from '@/features/admin/types/admin-overview.types';
import { AdminOverviewView } from '@/features/admin/components/admin-overview-view';
import { AdminOverviewSkeleton } from '@/features/admin/components/admin-overview-skeleton';
import { AdminOverviewError } from '@/features/admin/components/admin-overview-error';

export const Route = createFileRoute('/admin/')({
  validateSearch: (search: Record<string, unknown>): AdminOverviewSearchParams =>
    adminOverviewSearchSchema.parse(search),
  pendingComponent: AdminOverviewSkeleton,
  errorComponent: AdminOverviewError,
  component: AdminOverviewRoutePage,
});

function AdminOverviewRoutePage() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleNavigateSearch = (
    updater: (prev: AdminOverviewSearchParams) => AdminOverviewSearchParams,
  ) => {
    void navigate({
      search: (prev: AdminOverviewSearchParams) => updater(prev),
    });
  };

  return <AdminOverviewView searchParams={searchParams} onNavigateSearch={handleNavigateSearch} />;
}
