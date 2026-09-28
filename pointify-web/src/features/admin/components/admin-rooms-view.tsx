import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCwIcon, LayersIcon, UsersIcon, CheckCircle2Icon, ArchiveIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TypographyH2, TypographyMuted } from '@/components/ui/typography';
import { DataTable, type DataTableFilterOption } from '@/components/data-table';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import {
  useAdminRoomsQuery,
  useCloseRoomMutation,
  useTakeoverRoomMutation,
  useDeleteRoomMutation,
  useBulkCloseRoomsMutation,
  useBulkDeleteRoomsMutation,
} from '../api/use-admin-rooms';
import { getRoomTableColumns } from './room-table-columns';
import { RoomDetailDialog } from './room-detail-dialog';
import { RoomBulkActions } from './room-bulk-actions';
import type {
  AdminRoomsSearchParams,
  AdminRoomItemDto,
  RoomDetailDialogHandle,
} from '../types/admin-rooms.types';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

export interface AdminRoomsViewProps {
  searchParams: AdminRoomsSearchParams;
  onNavigateSearch: (updater: (prev: AdminRoomsSearchParams) => AdminRoomsSearchParams) => void;
}

export function AdminRoomsView({ searchParams, onNavigateSearch }: AdminRoomsViewProps) {
  const { t } = useTranslation('admin');
  const dialogRef = useRef<RoomDetailDialogHandle>(null);

  // TanStack Queries & Mutations
  const { data: apiResponse, isLoading, refetch, isFetching } = useAdminRoomsQuery(searchParams);
  const closeRoomMutation = useCloseRoomMutation();
  const takeoverRoomMutation = useTakeoverRoomMutation();
  const deleteRoomMutation = useDeleteRoomMutation();
  const bulkCloseMutation = useBulkCloseRoomsMutation();
  const bulkDeleteMutation = useBulkDeleteRoomsMutation();

  const rooms = apiResponse?.items || [];
  const total = apiResponse?.total || 0;
  const totalPages = apiResponse?.totalPages || 1;

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: React.ReactNode;
    description: React.ReactNode;
    confirmLabel?: string;
    variant?: 'default' | 'destructive';
    action: () => Promise<void> | void;
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  });

  // Debounced Search Input
  const [searchInput, setSearchInput] = useState(searchParams.search || '');
  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(searchParams.search || '');
  }, [searchParams.search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }
    searchDebounceTimerRef.current = setTimeout(() => {
      onNavigateSearch((prev) => ({
        ...prev,
        search: value.trim() ? value.trim() : undefined,
        page: 1,
      }));
    }, 300);
  };

  // Faceted Filters
  const facetedFilters = useMemo(
    () => [
      {
        columnId: 'status',
        title: t('admin.rooms.table.status', 'Trạng thái'),
        singleSelect: true,
        options: [
          { label: t('admin.rooms.statuses.active', 'Đang hoạt động'), value: 'active' },
          { label: t('admin.rooms.statuses.closed', 'Đã kết thúc'), value: 'closed' },
        ] as DataTableFilterOption[],
      },
    ],
    [t],
  );

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (searchParams.status && searchParams.status !== 'all') {
      filters.push({ id: 'status', value: [searchParams.status] });
    }
    return filters;
  }, [searchParams.status]);

  const handleColumnFiltersChange = (newFilters: ColumnFiltersState) => {
    const statusFilter = newFilters.find((f) => f.id === 'status');
    const extractSingle = (val: unknown) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val.length ? (val[val.length - 1] as string) : undefined;
      return val as string;
    };
    const statusVal = extractSingle(statusFilter?.value) as 'active' | 'closed' | undefined;

    onNavigateSearch((prev) => ({
      ...prev,
      status: statusVal,
      page: 1,
    }));
  };

  // Sorting
  const sorting = useMemo<SortingState>(() => {
    if (searchParams.sortBy) {
      return [{ id: searchParams.sortBy, desc: searchParams.sortOrder !== 'asc' }];
    }
    return [{ id: 'createdAt', desc: true }];
  }, [searchParams.sortBy, searchParams.sortOrder]);

  const handleSortingChange = (newSorting: SortingState) => {
    const firstSort = newSorting[0];
    if (firstSort) {
      onNavigateSearch((prev) => ({
        ...prev,
        sortBy: firstSort.id as 'createdAt' | 'name' | 'participants' | 'updatedAt',
        sortOrder: firstSort.desc ? 'desc' : 'asc',
      }));
    } else {
      onNavigateSearch((prev) => ({
        ...prev,
        sortBy: undefined,
        sortOrder: undefined,
      }));
    }
  };

  // Action Handlers
  const handleView = (room: AdminRoomItemDto) => {
    dialogRef.current?.open(room.id);
  };

  const handleTakeover = async (roomOrId: AdminRoomItemDto | string) => {
    const roomId = typeof roomOrId === 'string' ? roomOrId : roomOrId.id;
    try {
      const res = await takeoverRoomMutation.mutateAsync(roomId);
      if (res.data?.facilitatorKey) {
        sessionStorage.setItem(`pointify_facilitator_key_${roomId}`, res.data.facilitatorKey);
        toast.success(
          t('admin.rooms.toasts.takeoverSuccess', 'Đã nhận quyền điều phối. Đang mở phòng...'),
        );
        window.open(`/rooms/${roomId}`, '_blank');
      }
    } catch {
      // Handled in mutation onError
    }
  };

  const handleCloseRequest = (room: AdminRoomItemDto) => {
    setConfirmDialog({
      open: true,
      title: t('admin.rooms.dialogs.closeTitle', 'Xác nhận đóng phòng'),
      description: t('admin.rooms.dialogs.closeDesc', {
        name: room.name,
        defaultValue: `Bạn có chắc chắn muốn đóng phòng '${room.name}'?`,
      }),
      confirmLabel: t('admin.rooms.dialogs.confirmClose', 'Đóng phòng'),
      variant: 'default',
      action: async () => {
        await closeRoomMutation.mutateAsync(room.id);
      },
    });
  };

  const handleDeleteRequest = (room: AdminRoomItemDto) => {
    setConfirmDialog({
      open: true,
      title: t('admin.rooms.dialogs.deleteTitle', 'Xác nhận xóa phòng'),
      description: t('admin.rooms.dialogs.deleteDesc', {
        name: room.name,
        defaultValue: `Hành động này không thể hoàn tác. Phòng '${room.name}' sẽ bị xóa vĩnh viễn.`,
      }),
      confirmLabel: t('admin.rooms.dialogs.confirmDelete', 'Xóa vĩnh viễn'),
      variant: 'destructive',
      action: async () => {
        await deleteRoomMutation.mutateAsync(room.id);
      },
    });
  };

  // Bulk Handlers
  const handleBulkCloseRequest = (selected: AdminRoomItemDto[]) => {
    setConfirmDialog({
      open: true,
      title: t('admin.rooms.dialogs.bulkCloseTitle', 'Xác nhận đóng hàng loạt'),
      description: t('admin.rooms.dialogs.bulkCloseDesc', {
        count: selected.length,
        defaultValue: `Bạn có chắc muốn đóng ${selected.length} phòng ước lượng đã chọn?`,
      }),
      confirmLabel: t('admin.rooms.dialogs.confirmClose', 'Đóng phòng'),
      variant: 'default',
      action: async () => {
        await bulkCloseMutation.mutateAsync(selected.map((r) => r.id));
      },
    });
  };

  const handleBulkDeleteRequest = (selected: AdminRoomItemDto[]) => {
    setConfirmDialog({
      open: true,
      title: t('admin.rooms.dialogs.bulkDeleteTitle', 'Xác nhận xóa hàng loạt'),
      description: t('admin.rooms.dialogs.bulkDeleteDesc', {
        count: selected.length,
        defaultValue: `Hành động này không thể hoàn tác. ${selected.length} phòng đã chọn sẽ bị xóa vĩnh viễn.`,
      }),
      confirmLabel: t('admin.rooms.dialogs.confirmDelete', 'Xóa vĩnh viễn'),
      variant: 'destructive',
      action: async () => {
        await bulkDeleteMutation.mutateAsync(selected.map((r) => r.id));
      },
    });
  };

  const handleExportCsv = (selected: AdminRoomItemDto[]) => {
    const targetRooms = selected.length > 0 ? selected : rooms;
    if (targetRooms.length === 0) {
      toast.info('Không có dữ liệu để xuất');
      return;
    }

    const headers = [
      'Mã phòng',
      'Tên phòng',
      'Người điều phối',
      'Bộ bài',
      'Số thành viên',
      'Vòng',
      'Trạng thái',
      'Ngày tạo',
    ];
    const rows = targetRooms.map((r) => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.facilitatorName.replace(/"/g, '""')}"`,
      r.deckType,
      `${r.onlineCount}/${r.participantCount}`,
      r.currentRoundNumber,
      r.status,
      new Date(r.createdAt).toISOString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pointify-rooms-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất danh sách phòng ra tệp CSV');
  };

  // Table Columns
  const columns = useMemo(
    () =>
      getRoomTableColumns({
        onView: handleView,
        onTakeover: handleTakeover,
        onClose: handleCloseRequest,
        onDelete: handleDeleteRequest,
        t,
      }),
    [t],
  );

  // Quick Stats
  const activeCount = useMemo(() => rooms.filter((r) => r.status === 'active').length, [rooms]);
  const onlineParticipantsTotal = useMemo(
    () => rooms.reduce((acc, r) => acc + r.onlineCount, 0),
    [rooms],
  );

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <TypographyH2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <LayersIcon className="size-6 text-primary" />
            <span>{t('admin.rooms.title', 'Quản lý phòng ước lượng')}</span>
          </TypographyH2>
          <TypographyMuted className="text-xs sm:text-sm mt-1">
            {t(
              'admin.rooms.subtitle',
              'Giám sát, kiểm toán và điều hành tất cả các phiên Scrum Poker trong hệ thống',
            )}
          </TypographyMuted>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="h-[38px] px-3 gap-1.5 text-xs font-medium cursor-pointer shadow-2xs"
          >
            <RefreshCwIcon className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{t('admin.users.actions.refresh', 'Làm mới')}</span>
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg border border-border/70 bg-card shadow-2xs">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {t('admin.rooms.stats.totalRooms', 'Tổng số phòng')}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground font-mono mt-1">
            {total}
          </div>
        </div>
        <div className="p-3.5 rounded-lg border border-border/70 bg-card shadow-2xs">
          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2Icon className="size-3" />
            <span>{t('admin.rooms.stats.activeRooms', 'Phòng đang chạy')}</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {activeCount}
          </div>
        </div>
        <div className="p-3.5 rounded-lg border border-border/70 bg-card shadow-2xs">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ArchiveIcon className="size-3" />
            <span>{t('admin.rooms.stats.closedRooms', 'Phòng đã đóng')}</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-muted-foreground font-mono mt-1">
            {Math.max(0, total - activeCount)}
          </div>
        </div>
        <div className="p-3.5 rounded-lg border border-border/70 bg-card shadow-2xs">
          <div className="text-[11px] font-medium text-primary uppercase tracking-wider flex items-center gap-1.5">
            <UsersIcon className="size-3" />
            <span>{t('admin.rooms.stats.activeParticipants', 'Thành viên trực tuyến')}</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-primary font-mono mt-1">
            {onlineParticipantsTotal}
          </div>
        </div>
      </div>

      {/* Main Virtual Data Table */}
      <div className="flex-1 min-h-0 bg-card rounded-lg border border-border/80 shadow-xs overflow-hidden flex flex-col">
        <DataTable
          columns={columns}
          data={rooms}
          isLoading={isLoading}
          searchPlaceholder={t(
            'admin.rooms.filters.searchPlaceholder',
            'Tìm theo mã phòng, tên phòng hoặc người điều phối...',
          )}
          facetedFilters={facetedFilters}
          totalRows={total}
          serverPagination={{
            pageIndex: (searchParams.page || 1) - 1,
            pageSize: searchParams.limit || 20,
            pageCount: totalPages,
            onPaginationChange: (newPagination) => {
              onNavigateSearch((prev) => ({
                ...prev,
                page: newPagination.pageIndex + 1,
                limit: newPagination.pageSize,
              }));
            },
          }}
          serverSorting={{
            sorting,
            onSortingChange: handleSortingChange,
          }}
          serverFilters={{
            globalFilter: searchInput,
            onGlobalFilterChange: handleSearchChange,
            columnFilters,
            onColumnFiltersChange: handleColumnFiltersChange,
          }}
          floatingActions={(selectedRows) => (
            <RoomBulkActions
              selectedRows={selectedRows}
              isPending={bulkCloseMutation.isPending || bulkDeleteMutation.isPending}
              onBulkCloseRequest={handleBulkCloseRequest}
              onBulkDeleteRequest={handleBulkDeleteRequest}
              onExportCsv={handleExportCsv}
            />
          )}
        />
      </div>

      {/* Modal Dialog Chi tiết Phòng (React 19 Ref-as-a-prop) */}
      <RoomDetailDialog
        ref={dialogRef}
        onTakeover={handleTakeover}
        onCloseRoom={(id) => {
          const room = rooms.find((r) => r.id === id);
          if (room) handleCloseRequest(room);
        }}
      />

      {/* Confirm Destructive Action Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
      />
    </div>
  );
}
