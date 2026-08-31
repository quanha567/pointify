import { createRootRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { NotFoundPage } from '@/components/feedback/not-found';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import '@/i18n';
import { useEffect } from 'react';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <NotFoundPage />,
});

function RootLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest, guestName, logout, initAuthListener } = useAuthStore();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initAuthListener]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('auth.logoutToast'));
      void navigate({ to: '/' });
    } catch {
      toast.error(t('auth.failedSignOut'));
    }
  };

  if (isAdminRoute) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <div className="h-screen w-screen overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
            <Outlet />
            <Toaster richColors position="top-right" />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
          <PublicHeader
            user={user}
            isGuest={isGuest}
            guestName={guestName}
            onLogout={handleLogout}
          />

          <main className="flex-1">
            <Outlet />
          </main>

          <PublicFooter />
          <Toaster richColors position="top-right" />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}
