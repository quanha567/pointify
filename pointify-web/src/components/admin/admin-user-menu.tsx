import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { HomeIcon, LogOutIcon, SparklesIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Typography } from '@/components/ui/typography';
import { useAuthStore } from '@/store/useAuthStore';
import { getInitials } from '@/lib/utils';

export function AdminUserMenu() {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-8.5 items-center justify-center rounded-lg border border-border/60 bg-card hover:bg-accent transition-colors cursor-pointer"
        >
          <Avatar className="size-7 rounded-md text-[11px] font-bold">
            <AvatarImage
              src={user?.photoURL || undefined}
              alt={user?.displayName || t('admin.header.adminRole')}
              className="rounded-md"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold rounded-md">
              {getInitials(user?.displayName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-xl border-border">
        <DropdownMenuLabel className="px-2.5 py-1.5">
          <Typography variant="navTitle">
            {user?.displayName || t('admin.header.adminRole')}
          </Typography>
          <Typography variant="navSubtitle">{user?.email || 'admin@pointify.app'}</Typography>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
        >
          <Link to="/" className="flex items-center gap-2">
            <HomeIcon className="size-3.5 text-primary" />
            <span>{t('admin.header.backToHome')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
        >
          <Link to="/admin" className="flex items-center gap-2">
            <SparklesIcon className="size-3.5 text-violet-500" />
            <span>{t('admin.header.overview')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void logout();
          }}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
        >
          <LogOutIcon className="size-3.5" />
          <span>{t('admin.header.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
