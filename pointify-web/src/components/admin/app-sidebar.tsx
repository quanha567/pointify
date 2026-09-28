import otsEmblem from '@/assets/ots-emblem.png';
import { SidebarVesselWidget } from '@/components/admin/sidebar-vessel-widget';
import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarHeader,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarRail,
  useAnimatedSidebarPanel,
} from '@/components/motion/animated-sidebar';
import { SharedLayoutBg } from '@/components/motion/shared-layout-bg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { Link, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BarChart3Icon, HomeIcon, LayersIcon, ListChecksIcon, UsersIcon } from 'lucide-react';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

function AppSidebarHeader() {
  const { t } = useTranslation('admin');
  const { collapsed } = useAnimatedSidebarPanel();

  return (
    <AnimatedSidebarHeader
      className={cn(
        'p-4 pt-5 pb-3 border-b border-sidebar-border/30 transition-all duration-150',
        collapsed && 'p-2 py-4 flex items-center justify-center',
      )}
    >
      <Link
        to="/admin"
        className={cn(
          'flex flex-col items-start gap-2 w-full text-left transition-all duration-150 outline-none select-none cursor-pointer',
          collapsed && 'items-center justify-center',
        )}
      >
        {collapsed ? (
          <div className="flex items-center justify-center transition-all duration-150 h-8 w-full">
            <img
              src={otsEmblem}
              alt="ONE Tech Stop"
              className="size-8 object-contain select-none transition-all duration-150 drop-shadow-sm"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 transition-all duration-150">
            <img
              src={otsEmblem}
              alt="ONE Tech Stop"
              className="size-8.5 shrink-0 object-contain select-none drop-shadow-sm transition-all duration-150"
            />
            <div className="flex flex-col text-left leading-tight overflow-hidden">
              <span className="text-sm font-black text-white tracking-tight truncate">
                ONE TECH STOP
              </span>
              <span className="text-[11px] font-bold tracking-[0.14em] text-sidebar-foreground/75 uppercase select-none truncate">
                {t('admin.brand.motto')}
              </span>
            </div>
          </div>
        )}
      </Link>
    </AnimatedSidebarHeader>
  );
}

function AppSidebarContentItems() {
  const location = useLocation();
  const { t } = useTranslation('admin');
  const { collapsed } = useAnimatedSidebarPanel();

  const navItems: NavItem[] = [
    {
      title: t('admin.nav.home'),
      url: '/admin',
      icon: HomeIcon,
      exact: true,
    },
    {
      title: t('admin.nav.rooms'),
      url: '/admin/rooms',
      icon: LayersIcon,
    },
    {
      title: t('admin.nav.backlog'),
      url: '/admin/decks',
      icon: ListChecksIcon,
    },
    {
      title: t('admin.nav.team'),
      url: '/admin/users',
      icon: UsersIcon,
    },
    {
      title: t('admin.nav.reports'),
      url: '/admin/logs',
      icon: BarChart3Icon,
    },
  ];

  return (
    <AnimatedSidebarContent className={cn('p-3 pb-0', collapsed && 'p-2 pb-0 items-center')}>
      <SharedLayoutBg
        as="ul"
        className={cn('gap-1.5 list-none p-0 m-0 w-full', collapsed && 'items-center')}
      >
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.url
            : location.pathname.startsWith(item.url);

          return (
            <AnimatedSidebarMenuItem key={item.title}>
              <AnimatedSidebarMenuButton
                to={item.url}
                isActive={isActive}
                icon={<item.icon className="size-5" />}
              >
                {item.title}
              </AnimatedSidebarMenuButton>
            </AnimatedSidebarMenuItem>
          );
        })}
      </SharedLayoutBg>
    </AnimatedSidebarContent>
  );
}

function AppSidebarFooterSection() {
  const { collapsed } = useAnimatedSidebarPanel();
  const { user } = useAuthStore();
  const initials = (user?.displayName || user?.email || 'U').slice(0, 2).toUpperCase();

  if (collapsed) {
    return (
      <AnimatedSidebarFooter className="p-2 pb-4 flex items-center justify-center mt-auto">
        <Link
          to="/profile"
          title={user?.displayName || user?.email || 'Admin Profile'}
          className="cursor-pointer rounded-full ring-2 ring-primary/40 hover:ring-primary transition-all p-0.5"
        >
          <Avatar size="sm" className="size-8">
            {user?.photoURL && (
              <AvatarImage src={user.photoURL} alt={user.displayName || 'Admin'} />
            )}
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </AnimatedSidebarFooter>
    );
  }

  return (
    <AnimatedSidebarFooter className="p-0 border-t-0 bg-transparent space-y-0 relative overflow-hidden mt-auto">
      <SidebarVesselWidget />
    </AnimatedSidebarFooter>
  );
}

export function AppSidebar(props: React.ComponentProps<typeof AnimatedSidebar>) {
  return (
    <AnimatedSidebar
      collapsible="icon"
      {...props}
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm"
    >
      <AppSidebarHeader />
      <AppSidebarContentItems />
      <AppSidebarFooterSection />
      <AnimatedSidebarRail />
    </AnimatedSidebar>
  );
}
