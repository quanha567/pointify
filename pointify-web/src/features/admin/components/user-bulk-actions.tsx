import { useTranslation } from 'react-i18next';
import { CheckCircle2Icon, BanIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import type { UserAccountDto } from '../types/admin-users.types';

export interface UserBulkActionsProps {
  selectedRows: UserAccountDto[];
  isPending: boolean;
  onBulkActivate: (selectedRows: UserAccountDto[]) => void;
  onBulkDisableRequest: (selectedRows: UserAccountDto[]) => void;
}

export function UserBulkActions({
  selectedRows,
  isPending,
  onBulkActivate,
  onBulkDisableRequest,
}: UserBulkActionsProps) {
  const { t } = useTranslation();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onBulkActivate(selectedRows)}
        disabled={isPending}
        className="h-7.5 px-3 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 rounded-full font-medium cursor-pointer transition-colors shadow-2xs"
      >
        <CheckCircle2Icon className="mr-1.5 size-3.5 text-emerald-600 dark:text-emerald-400" />
        <Typography
          as="span"
          variant="small"
          className="text-xs font-medium text-emerald-700 dark:text-emerald-400"
        >
          {t('admin.users.bulk.activate', { count: selectedRows.length })}
        </Typography>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onBulkDisableRequest(selectedRows)}
        disabled={isPending}
        className="h-7.5 px-3 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/25 rounded-full font-medium cursor-pointer transition-colors shadow-2xs"
      >
        <BanIcon className="mr-1.5 size-3.5 text-rose-600 dark:text-rose-400" />
        <Typography
          as="span"
          variant="small"
          className="text-xs font-medium text-rose-700 dark:text-rose-400"
        >
          {t('admin.users.bulk.disable', { count: selectedRows.length })}
        </Typography>
      </Button>
    </>
  );
}
