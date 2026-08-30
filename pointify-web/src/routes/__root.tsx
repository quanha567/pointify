import { useEffect } from 'react';
import { createRootRoute, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useTranslation } from 'react-i18next';
import { LogIn, LogOut, Sparkles, ChevronDown } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import '@/i18n';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isGuest, guestName, logout, initAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => {
      unsubscribe();
    };
  }, [initAuthListener]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('auth.logoutToast'));
      void navigate({ to: '/' });
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
        {/* Glassmorphism Header */}
        <header className="sticky top-0 z-50 w-full border-b border-white/15 dark:border-white/5 bg-white/60 dark:bg-background/40 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
            {/* Left Brand */}
            <Link to="/" className="flex items-center">
              <Logo size="md" />
            </Link>

            {/* Right Controls */}
            <div className="flex items-center gap-2.5">
              <LanguageSwitcher />

              {/* Authenticated User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-border/80 bg-background/80 hover:bg-accent/80 backdrop-blur transition-all cursor-pointer shadow-2xs"
                    >
                      <Avatar className="size-6.5 text-[11px] font-bold">
                        {user.photoURL && (
                          <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                        )}
                        <AvatarFallback className="bg-primary/15 text-primary">
                          {getInitials(user.displayName || 'User')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold max-w-[120px] truncate hidden sm:inline">
                        {user.displayName}
                      </span>
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 p-1.5 rounded-xl shadow-lg border-border/80"
                  >
                    <DropdownMenuLabel className="px-2.5 py-1.5">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-normal truncate">
                        {user.email}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      asChild
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      <Link to="/" className="flex items-center gap-2">
                        <Sparkles className="size-3.5 text-primary" />
                        <span>{t('account.myRooms')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
                    >
                      <LogOut className="size-3.5" />
                      <span>{t('account.signOut')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : isGuest ? (
                /* Guest Badge & Upgrade Option */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur transition-all cursor-pointer shadow-2xs"
                    >
                      <Badge
                        variant="outline"
                        className="h-5 px-1.5 text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold"
                      >
                        {t('account.guestBadge')}
                      </Badge>
                      <span className="text-xs font-semibold max-w-[100px] truncate">
                        {guestName}
                      </span>
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 p-1.5 rounded-xl shadow-lg border-border/80"
                  >
                    <DropdownMenuLabel className="px-2.5 py-1.5">
                      <p className="text-xs font-semibold text-foreground">{guestName}</p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-normal">
                        Temporary Session
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      asChild
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      <Link
                        to="/auth"
                        search={{ mode: 'register' }}
                        className="flex items-center gap-2 text-primary font-semibold"
                      >
                        <Sparkles className="size-3.5" />
                        <span>{t('account.upgradeToAccount')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
                    >
                      <LogOut className="size-3.5" />
                      <span>{t('account.signOut')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* Unauthenticated Sign In Button */
                <Button
                  asChild
                  size="sm"
                  className="h-8.5 px-4 rounded-full text-xs font-semibold gap-1.5 shadow-sm shadow-primary/15 cursor-pointer"
                >
                  <Link to="/auth" search={{ mode: 'login' }}>
                    <LogIn className="size-3.5" />
                    <span className="hidden sm:inline">{t('nav.signIn')}</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6">
            <div className="flex items-center gap-1.5">
              <Logo variant="icon" size={18} animated={false} />
              <span>Pointify • Agile Scrum Poker</span>
            </div>
            <p className="text-muted-foreground/70">
              Built for seamless real-time sprint estimations.
            </p>
          </div>
        </footer>

        <Toaster richColors position="top-right" />
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </TooltipProvider>
  );
}
