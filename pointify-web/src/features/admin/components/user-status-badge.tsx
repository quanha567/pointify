import { useTranslation } from 'react-i18next';
import { BanIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface UserStatusBadgeProps {
  status: 'active' | 'disabled';
  className?: string;
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const { t } = useTranslation();

  if (status === 'active') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-md transition-colors',
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
          className,
        )}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span>{t('admin.users.statuses.active')}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md transition-colors',
        'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25',
        className,
      )}
    >
      <BanIcon className="size-3 text-rose-600 dark:text-rose-400 shrink-0" />
      <span>{t('admin.users.statuses.disabled')}</span>
    </Badge>
  );
}
