import { createFileRoute } from '@tanstack/react-router';
import {
  adminUsersSearchSchema,
  type AdminUsersSearchParams,
} from '@/features/admin/types/admin-users.types';
import { AdminUsersView } from '@/features/admin/components/admin-users-view';
import { AdminUsersSkeleton } from '@/features/admin/components/admin-users-skeleton';
import { AdminUsersError } from '@/features/admin/components/admin-users-error';

export const Route = createFileRoute('/admin/users')({
  validateSearch: (search: Record<string, unknown>): AdminUsersSearchParams =>
    adminUsersSearchSchema.parse(search),
  pendingComponent: AdminUsersSkeleton,
  errorComponent: AdminUsersError,
  component: AdminUsersRoutePage,
});

function AdminUsersRoutePage() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleNavigateSearch = (
    updater: (prev: AdminUsersSearchParams) => AdminUsersSearchParams,
  ) => {
    void navigate({
      search: (prev: AdminUsersSearchParams) => updater(prev),
    });
  };

  return <AdminUsersView searchParams={searchParams} onNavigateSearch={handleNavigateSearch} />;
}
