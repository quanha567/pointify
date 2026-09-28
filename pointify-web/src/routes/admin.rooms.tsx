import { createFileRoute } from '@tanstack/react-router';
import {
  adminRoomsSearchSchema,
  type AdminRoomsSearchParams,
} from '@/features/admin/types/admin-rooms.types';
import { AdminRoomsView } from '@/features/admin/components/admin-rooms-view';
import { AdminUsersSkeleton } from '@/features/admin/components/admin-users-skeleton';
import { AdminUsersError } from '@/features/admin/components/admin-users-error';

export const Route = createFileRoute('/admin/rooms')({
  validateSearch: (search: Record<string, unknown>): AdminRoomsSearchParams =>
    adminRoomsSearchSchema.parse(search),
  pendingComponent: AdminUsersSkeleton,
  errorComponent: AdminUsersError,
  component: AdminRoomsRoutePage,
});

function AdminRoomsRoutePage() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleNavigateSearch = (
    updater: (prev: AdminRoomsSearchParams) => AdminRoomsSearchParams,
  ) => {
    void navigate({
      search: (prev: AdminRoomsSearchParams) => updater(prev),
    });
  };

  return <AdminRoomsView searchParams={searchParams} onNavigateSearch={handleNavigateSearch} />;
}
