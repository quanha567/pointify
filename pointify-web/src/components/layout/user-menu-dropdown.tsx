import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { LogIn, LogOut, Sparkles, ChevronDown } from 'lucide-react';
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
import { getInitials } from '@/lib/utils';
import type { AuthUserProfile } from '@/store/useAuthStore';

interface UserMenuDropdownProps {
  user: AuthUserProfile | null;
  isGuest: boolean;
  guestName: string | null;
  onLogout: () => void;
}

export function UserMenuDropdown({ user, isGuest, guestName, onLogout }: UserMenuDropdownProps) {
  const { t } = useTranslation();

  if (user) {
    return (
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
            <p className="text-xs font-semibold text-foreground truncate">{user.displayName}</p>
            <p className="text-[11px] text-muted-foreground font-normal truncate">{user.email}</p>
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
            onClick={onLogout}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
          >
            <LogOut className="size-3.5" />
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
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur transition-all cursor-pointer shadow-2xs"
          >
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold"
            >
              {t('account.guestBadge')}
            </Badge>
            <span className="text-xs font-semibold max-w-[100px] truncate">{guestName}</span>
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
              {t('account.temporarySession')}
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
            onClick={onLogout}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
          >
            <LogOut className="size-3.5" />
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
      className="h-8.5 px-4 rounded-full text-xs font-semibold gap-1.5 shadow-sm shadow-primary/15 cursor-pointer"
    >
      <Link to="/auth" search={{ mode: 'login' }}>
        <LogIn className="size-3.5" />
        <span className="hidden sm:inline">{t('nav.signIn')}</span>
      </Link>
    </Button>
  );
}
