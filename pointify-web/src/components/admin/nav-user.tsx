import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  HomeIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserIcon,
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
  const { t } = useTranslation(['admin', 'auth']);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="size-8 rounded-lg border border-border/60">
                <AvatarImage
                  src={user?.photoURL || undefined}
                  alt={user?.displayName || t('admin.navUser.adminRole')}
                  className="rounded-lg object-cover"
                />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  {getInitials(user?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-xs leading-tight">
                <Typography variant="navTitle">
                  {user?.displayName || t('admin.navUser.adminRole')}
                </Typography>
                <Typography variant="navSubtitle">{user?.email || ''}</Typography>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg p-1.5 shadow-xl border-border bg-popover/95 backdrop-blur-xl"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 p-2.5 rounded-md bg-muted/40 border border-border/60">
                <Avatar className="size-10 rounded-md border border-border/80 shadow-2xs shrink-0">
                  <AvatarImage
                    src={user?.photoURL || undefined}
                    alt={user?.displayName || ''}
                    className="rounded-md object-cover"
                  />
                  <AvatarFallback className="rounded-md bg-primary/10 text-primary font-bold text-xs">
                    {getInitials(user?.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 min-w-0 text-left leading-tight">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {user?.displayName || t('admin.navUser.adminRole')}
                    </span>
                    <ShieldCheckIcon className="size-4 text-indigo-500 shrink-0" />
                  </div>
                  <span className="text-xs text-muted-foreground truncate font-normal mt-0.5">
                    {user?.email || ''}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                asChild
                className="cursor-pointer text-sm font-medium rounded-md px-2.5 py-2"
              >
                <Link to="/profile" className="flex items-center gap-2.5">
                  <UserIcon className="size-4 text-primary" />
                  <span>{t('auth:account.profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="cursor-pointer text-sm font-medium rounded-md px-2.5 py-2"
              >
                <Link to="/admin" className="flex items-center gap-2.5">
                  <SparklesIcon className="size-4 text-violet-500" />
                  <span>{t('auth:account.adminDashboard')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="cursor-pointer text-sm font-medium rounded-md px-2.5 py-2"
              >
                <Link to="/" className="flex items-center gap-2.5">
                  <HomeIcon className="size-4 text-emerald-500" />
                  <span>{t('auth:account.backToHome')}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void logout();
              }}
              className="cursor-pointer text-sm font-medium rounded-md px-2.5 py-2 text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2.5"
            >
              <LogOutIcon className="size-4" />
              <span>{t('auth:account.signOut')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
