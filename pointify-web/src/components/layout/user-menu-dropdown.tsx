import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  LogInIcon,
  LogOutIcon,
  SparklesIcon,
  ChevronDownIcon,
  UserIcon,
  HomeIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { useAuthStore, type AuthUserProfile } from '@/store/useAuthStore';

export interface UserMenuDropdownProps {
  user?: AuthUserProfile | null;
  isGuest?: boolean;
  guestName?: string | null;
  onLogout?: () => void;
}

export function UserMenuDropdown(props?: UserMenuDropdownProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useAuthStore();

  const user = props?.user !== undefined ? props.user : store.user;
  const isGuest = props?.isGuest !== undefined ? props.isGuest : store.isGuest;
  const guestName = props?.guestName !== undefined ? props.guestName : store.guestName;

  const handleLogout = () => {
    if (props?.onLogout) {
      props.onLogout();
    } else {
      void store.logout();
      void navigate({ to: '/' });
    }
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-border/80 bg-background/80 hover:bg-accent/80 hover:border-border backdrop-blur transition-all cursor-pointer shadow-2xs group"
          >
            <Avatar className="size-7 border border-border/70 shadow-2xs group-hover:scale-105 transition-transform">
              <AvatarImage
                src={user.photoURL || undefined}
                alt={user.displayName || ''}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                {getInitials(user.displayName || 'User')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium max-w-[130px] truncate hidden sm:inline text-foreground">
              {user.displayName}
            </span>
            <ChevronDownIcon className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 p-1.5 rounded-2xl shadow-xl border-border bg-popover/95 backdrop-blur-xl"
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <Avatar className="size-10 rounded-xl border border-border/80 shadow-2xs shrink-0">
                <AvatarImage
                  src={user.photoURL || undefined}
                  alt={user.displayName || ''}
                  className="rounded-xl object-cover"
                />
                <AvatarFallback className="rounded-xl bg-primary/15 text-primary font-bold text-xs">
                  {getInitials(user.displayName || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 min-w-0 text-left leading-tight">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {user.displayName || t('profile.anonymousUser')}
                  </span>
                  {user.role === 'admin' && (
                    <ShieldCheckIcon className="size-4 text-indigo-500 shrink-0" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate font-normal mt-0.5">
                  {user.email || ''}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              asChild
              className="px-2.5 py-2 rounded-xl text-sm font-medium cursor-pointer"
            >
              <Link to="/profile" className="flex items-center gap-2.5">
                <UserIcon className="size-4 text-primary" />
                <span>{t('account.profile')}</span>
              </Link>
            </DropdownMenuItem>
            {user.role === 'admin' && (
              <DropdownMenuItem
                asChild
                className="px-2.5 py-2 rounded-xl text-sm font-medium cursor-pointer"
              >
                <Link to="/admin" className="flex items-center gap-2.5">
                  <SparklesIcon className="size-4 text-violet-500" />
                  <span>{t('account.adminDashboard')}</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              asChild
              className="px-2.5 py-2 rounded-xl text-sm font-medium cursor-pointer"
            >
              <Link to="/" className="flex items-center gap-2.5">
                <HomeIcon className="size-4 text-emerald-500" />
                <span>{t('account.backToHome')}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="px-2.5 py-2 rounded-xl text-sm font-medium text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2.5"
          >
            <LogOutIcon className="size-4" />
            <span>{t('account.signOut')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isGuest) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur transition-all cursor-pointer shadow-2xs group"
          >
            <span className="h-5 px-2 text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full flex items-center">
              {t('account.guestBadge')}
            </span>
            <span className="text-sm font-medium text-foreground max-w-[110px] truncate">
              {guestName}
            </span>
            <ChevronDownIcon className="size-3.5 text-amber-600/80 dark:text-amber-400/80 group-hover:text-amber-600 transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 p-1.5 rounded-2xl shadow-xl border-border bg-popover/95 backdrop-blur-xl"
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
              <Avatar className="size-10 rounded-xl border border-amber-500/30 shadow-2xs shrink-0">
                <AvatarFallback className="rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs">
                  {getInitials(guestName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 min-w-0 text-left leading-tight">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {guestName || t('profile.anonymousUser')}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
                    {t('account.guestBadge')}
                  </span>
                </div>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium truncate mt-0.5">
                  {t('account.temporarySession')}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              asChild
              className="px-2.5 py-2 rounded-xl text-sm font-medium cursor-pointer"
            >
              <Link
                to="/auth"
                search={{ mode: 'register' }}
                className="flex items-center gap-2.5 text-primary font-semibold"
              >
                <SparklesIcon className="size-4" />
                <span>{t('account.upgradeToAccount')}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="px-2.5 py-2 rounded-xl text-sm font-medium text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2.5"
          >
            <LogOutIcon className="size-4" />
            <span>{t('account.signOut')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Unauthenticated
  return (
    <Button
      asChild
      size="sm"
      className="h-9 px-4 rounded-full text-sm font-medium gap-2 shadow-xs cursor-pointer"
    >
      <Link to="/auth" search={{ mode: 'login' }}>
        <LogInIcon className="size-4" />
        <span className="hidden sm:inline">{t('nav.signIn')}</span>
      </Link>
    </Button>
  );
}
