import { useEffect } from 'react';
import { createFileRoute, Outlet, useNavigate, redirect } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  AnimatedSidebarProvider,
  AnimatedSidebarInset,
} from '@/components/motion/animated-sidebar';
import { AppSidebar } from '@/components/admin/app-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { NotFoundPage } from '@/components/feedback/not-found';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    const { user, isInitialized } = useAuthStore.getState();
    if (isInitialized) {
      if (!user) {
        throw redirect({ to: '/auth' });
      }
      if (user.role && user.role !== 'admin') {
        throw redirect({ to: '/' });
      }
    }
  },
  notFoundComponent: () => <NotFoundPage backTo="/admin" />,
  component: AdminLayout,
});

function AdminLayout() {
  const { t } = useTranslation('admin');
  const { user, isInitialized, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!user) {
        toast.error(t('admin.guard.loginRequired'));
        void navigate({ to: '/auth' });
      } else if (user.role && user.role !== 'admin') {
        toast.error(t('admin.guard.noPermission'));
        void navigate({ to: '/' });
      }
    }
  }, [user, isInitialized, isLoading, navigate, t]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">{t('admin.guard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role && user.role !== 'admin')) {
    return null;
  }

  return (
    <AnimatedSidebarProvider defaultOpen={true}>
      <AppSidebar />
      <AnimatedSidebarInset className="flex h-screen flex-col overflow-hidden bg-background">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </AnimatedSidebarInset>
    </AnimatedSidebarProvider>
  );
}
