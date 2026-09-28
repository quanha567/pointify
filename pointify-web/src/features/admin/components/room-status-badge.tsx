import { useTranslation } from 'react-i18next';
import { ClockIcon, ArchiveIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface RoomStatusBadgeProps {
  status: 'active' | 'closed';
  isStale?: boolean;
  className?: string;
}

export function RoomStatusBadge({ status, isStale, className }: RoomStatusBadgeProps) {
  const { t } = useTranslation('admin');

  if (status === 'closed') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-sm transition-colors',
          'bg-muted/60 text-muted-foreground border-border/60',
          className,
        )}
      >
        <ArchiveIcon className="size-3 text-muted-foreground shrink-0" />
        <span>{t('admin.rooms.statuses.closed', 'Đã kết thúc')}</span>
      </Badge>
    );
  }

  if (isStale) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-sm transition-colors',
          'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
          className,
        )}
      >
        <ClockIcon className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>{t('admin.rooms.statuses.stale', 'Không hoạt động')}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-sm transition-colors',
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
      </span>
      <span>{t('admin.rooms.statuses.active', 'Đang hoạt động')}</span>
    </Badge>
  );
}
