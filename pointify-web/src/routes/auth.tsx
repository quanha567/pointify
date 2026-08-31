import { createFileRoute, redirect } from '@tanstack/react-router';
import { authSearchSchema, type AuthSearchParams } from '@/features/auth/types/auth.types';
import { AuthPage } from '@/features/auth/components/auth-page';
import { useAuthStore } from '@/store/useAuthStore';

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>): AuthSearchParams =>
    authSearchSchema.parse(search),
  beforeLoad: () => {
    const { user, isGuest } = useAuthStore.getState();
    if (user || isGuest) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthRoutePage,
});

function AuthRoutePage() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleNavigateSearch = (updater: (prev: AuthSearchParams) => AuthSearchParams) => {
    void navigate({
      search: (prev: AuthSearchParams) => updater(prev),
      replace: true,
    });
  };

  return <AuthPage searchParams={searchParams} onNavigateSearch={handleNavigateSearch} />;
}
