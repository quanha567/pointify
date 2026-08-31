import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  HomeIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Typography } from '@/components/ui/typography';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { getInitials } from '@/lib/utils';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user?.photoURL || undefined}
                  alt={user?.displayName || t('admin.navUser.adminRole')}
                />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  {getInitials(user?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-xs leading-tight">
                <Typography variant="navTitle">
                  {user?.displayName || t('admin.navUser.adminRole')}
                </Typography>
                <Typography variant="navSubtitle">{user?.email || 'admin@pointify.app'}</Typography>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl p-1.5 shadow-xl border-border"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-1.5 text-left text-xs">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    {getInitials(user?.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <Typography variant="navTitle" className="flex items-center gap-1">
                    {user?.displayName || t('admin.navUser.adminRole')}
                    <ShieldCheckIcon className="size-3 text-emerald-500" />
                  </Typography>
                  <Typography variant="navSubtitle">
                    {user?.email || 'admin@pointify.app'}
                  </Typography>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer text-xs rounded-lg px-2.5 py-1.5">
                <Link to="/">
                  <HomeIcon className="mr-2 size-3.5 text-primary" />
                  <span>{t('admin.navUser.backToApp')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer text-xs rounded-lg px-2.5 py-1.5">
                <Link to="/admin">
                  <SparklesIcon className="mr-2 size-3.5 text-violet-500" />
                  <span>{t('admin.navUser.systemOverview')}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void logout();
              }}
              className="cursor-pointer text-xs rounded-lg px-2.5 py-1.5 text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOutIcon className="mr-2 size-3.5" />
              <span>{t('admin.navUser.signOut')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
