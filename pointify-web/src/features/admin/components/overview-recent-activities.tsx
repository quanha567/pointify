import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlusIcon, LayersIcon, ArrowRightIcon, UsersIcon, ActivityIcon } from 'lucide-react';
import type { RecentActivityItem } from '../types/admin-overview.types';

interface OverviewRecentActivitiesProps {
  activities: RecentActivityItem[];
}

export function OverviewRecentActivities({ activities }: OverviewRecentActivitiesProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith('vi') ? vi : enUS;

  const formatRelativeTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: dateLocale,
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Recent Activities List (2 cols) */}
      <Card className="border border-border bg-card shadow-xs lg:col-span-2">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ActivityIcon className="size-4 text-primary" />
                <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">
                  {t('admin.overview.recentActivities.title')}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                {t('admin.overview.recentActivities.subtitle')}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-normal">
              {activities.length} mới nhất
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {activities.length === 0 ? (
            <div className="flex h-36 items-center justify-center text-xs text-muted-foreground">
              {t('admin.overview.recentActivities.empty')}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {activities.map((item) => {
                const isUser = item.type === 'user_registered';

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 transition-colors hover:bg-muted/40 px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                          isUser
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        }`}
                      >
                        {isUser ? (
                          <UserPlusIcon className="size-4" />
                        ) : (
                          <LayersIcon className="size-4" />
                        )}
                      </div>

                      <div className="grid gap-0.5 truncate">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-3">
                      <Badge
                        variant={isUser ? 'secondary' : 'outline'}
                        className="text-xs font-medium"
                      >
                        {isUser
                          ? t('admin.overview.recentActivities.userRegistered')
                          : t('admin.overview.recentActivities.roomCreated')}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:inline-block">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Navigation Links (1 col) */}
      <Card className="flex flex-col justify-between border border-border bg-card shadow-xs">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">
            {t('admin.overview.quickLinks.title')}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Các lối tắt truy cập nhanh vào phân hệ quản trị
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 p-5 pt-0">
          <Link
            to="/admin/users"
            className="group flex flex-col rounded-xl border border-border p-3.5 transition-all hover:border-primary/50 hover:bg-muted/40 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UsersIcon className="size-4" />
                </div>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {t('admin.overview.quickLinks.manageUsers')}
                </span>
              </div>
              <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('admin.overview.quickLinks.manageUsersDesc')}
            </p>
          </Link>

          <div className="group flex flex-col rounded-xl border border-border/60 bg-muted/20 p-3.5 opacity-80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <LayersIcon className="size-4" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {t('admin.overview.quickLinks.exploreRooms')}
                </span>
              </div>
              <Badge variant="outline" className="text-xs font-normal">
                {t('admin.nav.comingSoon')}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('admin.overview.quickLinks.exploreRoomsDesc')}
            </p>
          </div>

          <div className="mt-auto pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full justify-center text-xs font-medium cursor-pointer"
            >
              <Link to="/admin/users">
                {t('admin.overview.usersCard.openUsers', 'Mở danh sách tài khoản')}
                <ArrowRightIcon className="ml-1 size-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
