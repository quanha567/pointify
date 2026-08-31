import { NavUser } from '@/components/admin/nav-user';
import { Logo } from '@/components/logo';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Link, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  DicesIcon,
  LayersIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { t } = useTranslation();

  const navGroups: NavGroup[] = [
    {
      label: t('admin.nav.overview'),
      items: [
        {
          title: t('admin.nav.dashboard'),
          url: '/admin',
          icon: LayoutDashboardIcon,
          exact: true,
        },
      ],
    },
    {
      label: t('admin.nav.management'),
      items: [
        {
          title: t('admin.nav.users'),
          url: '/admin/users',
          icon: UsersIcon,
        },
        {
          title: t('admin.nav.rooms'),
          url: '/admin/rooms',
          icon: LayersIcon,
          badge: t('admin.nav.comingSoon'),
          disabled: true,
        },
        {
          title: t('admin.nav.decks'),
          url: '/admin/decks',
          icon: DicesIcon,
          badge: t('admin.nav.comingSoon'),
          disabled: true,
        },
      ],
    },
    {
      label: t('admin.nav.system'),
      items: [
        {
          title: t('admin.nav.settings'),
          url: '/admin/settings',
          icon: SettingsIcon,
          badge: t('admin.nav.comingSoon'),
          disabled: true,
        },
        {
          title: t('admin.nav.logs'),
          url: '/admin/logs',
          icon: ScrollTextIcon,
          badge: t('admin.nav.comingSoon'),
          disabled: true,
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-border bg-card">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-border/80 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin" className="flex items-center gap-3">
                <div className="flex aspect-square size-8.5 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                  <Logo variant="icon" size={22} animated={false} />
                </div>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <Typography variant="navTitle">{t('admin.brand.title')}</Typography>
                  <Typography variant="navSubtitle">{t('admin.brand.subtitle')}</Typography>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav Groups */}
      <SidebarContent className="gap-1 p-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1.5">
            <SidebarGroupLabel asChild>
              <Typography variant="navGroupLabel" className="px-2">
                {group.label}
              </Typography>
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.url
                  : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.url} className="relative">
                    {/* Left active vertical indicator bar with smooth spring animation */}
                    {isActive ? (
                      <motion.div
                        layoutId="active-nav-indicator"
                        className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-full rounded-r-full bg-primary z-20 group-data-[collapsible=icon]:hidden"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    ) : (
                      !item.disabled && (
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-full rounded-r-full bg-primary/50 opacity-0 group-hover/menu-item:opacity-100 transition-opacity duration-150 z-20 group-data-[collapsible=icon]:hidden pointer-events-none" />
                      )
                    )}

                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        'relative cursor-pointer text-xs font-medium transition-colors duration-150 h-9 px-3 data-active:bg-transparent data-active:text-primary-foreground',
                        isActive
                          ? 'text-primary-foreground hover:text-primary-foreground hover:bg-transparent font-semibold'
                          : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
                        item.disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
                      )}
                    >
                      <Link
                        to={item.disabled ? undefined : item.url}
                        className="relative flex items-center gap-2.5 z-10 w-full"
                      >
                        {/* Animated background pill with motion layoutId */}
                        {isActive && (
                          <motion.div
                            layoutId="active-nav-bg"
                            className="absolute inset-0 rounded-lg bg-primary -z-10"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}

                        <item.icon
                          className={cn(
                            'size-4 shrink-0 transition-colors z-10',
                            isActive
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground group-hover/menu-button:text-foreground',
                          )}
                        />
                        <Typography
                          variant="navItem"
                          className={cn(
                            'z-10',
                            isActive
                              ? 'text-primary-foreground font-semibold'
                              : 'text-muted-foreground group-hover/menu-button:text-foreground',
                          )}
                        >
                          {item.title}
                        </Typography>
                      </Link>
                    </SidebarMenuButton>

                    {item.badge && (
                      <SidebarMenuBadge className="pointer-events-none z-10">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[9px] px-1.5 py-0 h-4 font-semibold rounded-md border-0 transition-colors',
                            isActive
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {item.badge}
                        </Badge>
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer User */}
      <SidebarFooter className="border-t border-border/80 p-2">
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
