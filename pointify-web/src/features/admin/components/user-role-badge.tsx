import { useTranslation } from 'react-i18next';
import { ShieldCheckIcon, UserCheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface UserRoleBadgeProps {
  role: 'admin' | 'member';
  className?: string;
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const { t } = useTranslation();

  if (role === 'admin') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-md transition-colors',
          'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25',
          className,
        )}
      >
        <ShieldCheckIcon className="size-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span>{t('admin.users.roles.admin')}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md transition-colors',
        'bg-secondary/60 text-secondary-foreground border-border',
        className,
      )}
    >
      <UserCheckIcon className="size-3.5 text-muted-foreground shrink-0" />
      <span>{t('admin.users.roles.member')}</span>
    </Badge>
  );
}
