import { createFileRoute, redirect } from '@tanstack/react-router';
import { ProfileView } from '@/features/profile/components/profile-view';
import { useAuthStore } from '@/store/useAuthStore';

export const Route = createFileRoute('/profile')({
  beforeLoad: () => {
    const { user, isGuest, isInitialized } = useAuthStore.getState();
    if (isInitialized && !user && !isGuest) {
      throw redirect({
        to: '/auth',
        search: { mode: 'login' },
      });
    }
  },
  component: ProfilePage,
});

function ProfilePage() {
  return <ProfileView />;
}
