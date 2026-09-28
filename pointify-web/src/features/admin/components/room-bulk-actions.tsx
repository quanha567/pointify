import { useTranslation } from 'react-i18next';
import { ArchiveIcon, Trash2Icon, DownloadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminRoomItemDto } from '../types/admin-rooms.types';

export interface RoomBulkActionsProps {
  selectedRows: AdminRoomItemDto[];
  isPending: boolean;
  onBulkCloseRequest: (selectedRows: AdminRoomItemDto[]) => void;
  onBulkDeleteRequest: (selectedRows: AdminRoomItemDto[]) => void;
  onExportCsv: (selectedRows: AdminRoomItemDto[]) => void;
}

export function RoomBulkActions({
  selectedRows,
  isPending,
  onBulkCloseRequest,
  onBulkDeleteRequest,
  onExportCsv,
}: RoomBulkActionsProps) {
  const { t } = useTranslation('admin');

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onBulkCloseRequest(selectedRows)}
        disabled={isPending}
        className="h-[38px] px-3.5 text-sm gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/25 rounded-md font-medium cursor-pointer transition-colors shadow-2xs"
      >
        <ArchiveIcon className="size-4 text-amber-600 dark:text-amber-400" />
        <span>
          {t('admin.rooms.bulk.close', {
            count: selectedRows.length,
            defaultValue: `Đóng (${selectedRows.length})`,
          })}
        </span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onBulkDeleteRequest(selectedRows)}
        disabled={isPending}
        className="h-[38px] px-3.5 text-sm gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/25 rounded-md font-medium cursor-pointer transition-colors shadow-2xs"
      >
        <Trash2Icon className="size-4 text-rose-600 dark:text-rose-400" />
        <span>
          {t('admin.rooms.bulk.delete', {
            count: selectedRows.length,
            defaultValue: `Xóa (${selectedRows.length})`,
          })}
        </span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExportCsv(selectedRows)}
        disabled={isPending}
        className="h-[38px] px-3.5 text-sm gap-1.5 rounded-md font-medium cursor-pointer transition-colors shadow-2xs"
      >
        <DownloadIcon className="size-4 text-muted-foreground" />
        <span>{t('admin.rooms.bulk.export', 'Xuất CSV')}</span>
      </Button>
    </>
  );
}
