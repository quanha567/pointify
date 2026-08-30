import { useState } from 'react';
import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router';
import {
  UsersIcon,
  LayoutDashboardIcon,
  LayersIcon,
  DicesIcon,
  SettingsIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  LogOutIcon,
  ExternalLinkIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Logo } from '../components/Logo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
});

function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    {
      title: 'Quản lý tài khoản',
      path: '/admin/users',
      icon: UsersIcon,
      badge: 'Active',
      badgeVariant: 'default' as const,
    },
    {
      title: 'Tổng quan hệ thống',
      path: '/admin',
      icon: LayoutDashboardIcon,
      exact: true,
    },
    {
      title: 'Phòng ước lượng',
      path: '/admin/rooms',
      icon: LayersIcon,
      badge: 'Sắp có',
      badgeVariant: 'secondary' as const,
      disabled: true,
    },
    {
      title: 'Bộ bài (Decks)',
      path: '/admin/decks',
      icon: DicesIcon,
      badge: 'Sắp có',
      badgeVariant: 'secondary' as const,
      disabled: true,
    },
    {
      title: 'Cấu hình hệ thống',
      path: '/admin/settings',
      icon: SettingsIcon,
      badge: 'Sắp có',
      badgeVariant: 'secondary' as const,
      disabled: true,
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Admin Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-border/70 bg-card/60 backdrop-blur-xl transition-all duration-300 z-30',
          sidebarCollapsed ? 'w-18' : 'w-64',
        )}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <Logo size={28} />
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                  Pointify Admin
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  v1.0 • Enterprise
                </span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hidden lg:flex"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpenIcon className="h-4 w-4" />
            ) : (
              <PanelLeftCloseIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1.5">
            {!sidebarCollapsed && (
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Phân hệ Quản trị
              </p>
            )}
          </div>
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.disabled ? undefined : item.path}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                  item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                  sidebarCollapsed && 'justify-center px-2',
                )}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground group-hover:text-primary',
                  )}
                />
                {!sidebarCollapsed && <span className="flex-1 truncate">{item.title}</span>}
                {!sidebarCollapsed && item.badge && (
                  <Badge
                    variant={isActive ? 'secondary' : item.badgeVariant}
                    className={cn(
                      'text-[9px] px-1.5 py-0 h-4 font-normal',
                      isActive && 'bg-primary-foreground/20 text-primary-foreground border-0',
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Bottom Profile */}
        <div className="p-3 border-t border-border/60">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-accent/60 transition-colors border border-transparent hover:border-border/50',
                  sidebarCollapsed && 'justify-center p-1',
                )}
              >
                <Avatar className="h-8 w-8 ring-2 ring-primary/30">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                    {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'AD'}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs truncate">
                      {user?.displayName || 'Administrator'}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {user?.email || 'admin@pointify.app'}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              className="w-56 shadow-2xl border-border/60"
            >
              <DropdownMenuLabel className="text-xs">Tài khoản Quản trị</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer text-xs">
                <Link to="/">
                  <ExternalLinkIcon className="mr-2 h-3.5 w-3.5" />
                  Về trang ứng dụng chính
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="cursor-pointer text-xs text-destructive hover:bg-destructive/10"
              >
                <LogOutIcon className="mr-2 h-3.5 w-3.5" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-border/60 bg-card/40 backdrop-blur-md z-20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/admin" className="hover:text-foreground font-medium">
              Admin
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <span className="text-foreground font-semibold">
              {location.pathname === '/admin/users'
                ? 'Quản lý tài khoản (Users)'
                : 'Bảng điều khiển'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              <span>Admin Mode</span>
            </div>

            <LanguageSwitcher />

            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs gap-1.5 border-border/80 hover:border-primary/50"
            >
              <Link to="/">
                <ExternalLinkIcon className="h-3.5 w-3.5" />
                <span>Trang chủ</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Sub-route Outlet */}
        <main className="flex-1 overflow-hidden p-6 bg-gradient-to-b from-background via-background/95 to-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
