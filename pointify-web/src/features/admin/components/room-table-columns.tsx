import { format } from 'date-fns';
import {
  MoreHorizontalIcon,
  CopyIcon,
  EyeIcon,
  CrownIcon,
  ArchiveIcon,
  Trash2Icon,
  UsersIcon,
  LayersIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DataTableColumnHeader, type DataTableColumnDef } from '@/components/data-table';
import type { TFunction } from 'i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoomStatusBadge } from './room-status-badge';
import type { AdminRoomItemDto } from '../types/admin-rooms.types';

export interface GetRoomTableColumnsOptions {
  onView: (room: AdminRoomItemDto) => void;
  onTakeover: (room: AdminRoomItemDto) => void;
  onClose: (room: AdminRoomItemDto) => void;
  onDelete: (room: AdminRoomItemDto) => void;
  t: TFunction<'admin'>;
}

export function getRoomTableColumns({
  onView,
  onTakeover,
  onClose,
  onDelete,
  t,
}: GetRoomTableColumnsOptions): DataTableColumnDef<AdminRoomItemDto>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          aria-label={t('admin.users.table.selectAll', 'Chọn tất cả')}
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label={t('admin.users.table.selectRow', 'Chọn dòng')}
          className="translate-y-0.5"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('admin.rooms.table.roomCode', 'Mã phòng')}
        />
      ),
      cell: ({ row }) => {
        const id = row.original.id;
        const handleCopy = (e: React.MouseEvent) => {
          e.stopPropagation();
          void navigator.clipboard.writeText(id);
          toast.success(t('admin.rooms.toasts.copiedCode', 'Đã sao chép mã phòng'));
        };

        return (
          <div className="flex items-center gap-1.5 group/code">
            <span className="font-mono text-xs font-bold text-primary tracking-wider select-all">
              {id}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-5 opacity-0 group-hover/code:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              title={t('admin.rooms.actions.copyCode', 'Sao chép mã')}
            >
              <CopyIcon className="size-3" />
            </Button>
          </div>
        );
      },
      size: 130,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('admin.rooms.table.roomName', 'Tên phòng')}
        />
      ),
      cell: ({ row }) => {
        const name = row.original.name;
        return (
          <div className="flex items-center gap-2 min-w-0 max-w-[260px]">
            <div className="size-6 shrink-0 rounded bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <LayersIcon className="size-3.5" />
            </div>
            <span
              className="font-semibold text-xs sm:text-sm text-foreground truncate"
              title={name}
            >
              {name}
            </span>
          </div>
        );
      },
      size: 220,
    },
    {
      accessorKey: 'facilitatorName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('admin.rooms.table.facilitator', 'Người điều phối')}
        />
      ),
      cell: ({ row }) => {
        const facilitatorName = row.original.facilitatorName;
        const initials = facilitatorName.slice(0, 2).toUpperCase();

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6 border border-border/60">
              <AvatarFallback className="text-[10px] bg-secondary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span
              className="text-xs font-medium text-foreground truncate max-w-[140px]"
              title={facilitatorName}
            >
              {facilitatorName}
            </span>
          </div>
        );
      },
      size: 160,
    },
    {
      accessorKey: 'deckType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.rooms.table.deck', 'Bộ bài')} />
      ),
      cell: ({ row }) => {
        const deckType = row.original.deckType;
        return (
          <Badge variant="secondary" className="text-[11px] font-medium capitalize px-2 py-0.5">
            {deckType}
          </Badge>
        );
      },
      size: 110,
    },
    {
      id: 'participants',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('admin.rooms.table.participants', 'Thành viên')}
        />
      ),
      cell: ({ row }) => {
        const { onlineCount, participantCount } = row.original;
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <UsersIcon className="size-3.5 text-primary/70 shrink-0" />
            <span>
              <strong className="text-foreground">{onlineCount}</strong>
              <span className="text-muted-foreground/60">/{participantCount}</span>
            </span>
          </div>
        );
      },
      size: 110,
    },
    {
      accessorKey: 'currentRoundNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.rooms.table.round', 'Vòng')} />
      ),
      cell: ({ row }) => {
        const { currentRoundNumber, currentRoundStatus } = row.original;
        const isRevealed = currentRoundStatus === 'revealed';

        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-foreground">
              #{currentRoundNumber}
            </span>
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] px-1.5 py-0 font-medium capitalize',
                isRevealed
                  ? 'border-primary/30 text-primary bg-primary/5'
                  : 'text-muted-foreground',
              )}
            >
              {currentRoundStatus}
            </Badge>
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('admin.rooms.table.status', 'Trạng thái')}
        />
      ),
      cell: ({ row }) => (
        <RoomStatusBadge status={row.original.status} isStale={row.original.isStale} />
      ),
      size: 140,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('admin.rooms.table.createdAt', 'Ngày tạo')}
        />
      ),
      cell: ({ row }) => {
        const timestamp = row.original.createdAt;
        if (!timestamp) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
            {format(new Date(timestamp), 'dd/MM/yyyy HH:mm')}
          </span>
        );
      },
      size: 150,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const room = row.original;
        const isClosed = room.status === 'closed';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-7 p-0 data-[state=open]:bg-muted hover:bg-muted/80 rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontalIcon className="size-4" />
                <span className="sr-only">{t('admin.users.actions.openMenu', 'Mở menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {t('admin.rooms.table.roomCode', 'Phòng')}:{' '}
                <span className="font-mono font-bold text-foreground">{room.id}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => onView(room)}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <EyeIcon className="size-3.5 text-primary" />
                  <span>{t('admin.rooms.actions.viewDetail', 'Xem chi tiết phòng')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onTakeover(room)}
                  className="gap-2 cursor-pointer text-xs text-primary font-medium"
                >
                  <CrownIcon className="size-3.5 text-primary" />
                  <span>{t('admin.rooms.actions.joinAsFacilitator', 'Vào phòng (Điều phối)')}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {!isClosed && (
                  <DropdownMenuItem
                    onClick={() => onClose(room)}
                    className="gap-2 cursor-pointer text-xs text-amber-600 dark:text-amber-400 focus:text-amber-600"
                  >
                    <ArchiveIcon className="size-3.5" />
                    <span>{t('admin.rooms.actions.closeRoom', 'Đóng phòng')}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(room)}
                  className="gap-2 cursor-pointer text-xs text-rose-600 dark:text-rose-400 focus:text-rose-600"
                >
                  <Trash2Icon className="size-3.5" />
                  <span>{t('admin.rooms.actions.deleteRoom', 'Xóa phòng')}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 50,
      enableSorting: false,
    },
  ];
}
