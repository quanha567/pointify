import { useTranslation } from 'react-i18next';
import { CheckCircle2Icon, BanIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        className="h-8.5 px-3.5 text-xs sm:text-sm gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 rounded-full font-medium cursor-pointer transition-colors shadow-2xs"
      >
        <CheckCircle2Icon className="size-3.5 sm:size-4 text-emerald-600 dark:text-emerald-400" />
        <span>{t('admin.users.bulk.activate', { count: selectedRows.length })}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onBulkDisableRequest(selectedRows)}
        disabled={isPending}
        className="h-8.5 px-3.5 text-xs sm:text-sm gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/25 rounded-full font-medium cursor-pointer transition-colors shadow-2xs"
      >
        <BanIcon className="size-3.5 sm:size-4 text-rose-600 dark:text-rose-400" />
        <span>{t('admin.users.bulk.disable', { count: selectedRows.length })}</span>
      </Button>
    </>
  );
}
