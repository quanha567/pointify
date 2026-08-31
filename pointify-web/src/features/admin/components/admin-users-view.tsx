import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlusIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { TypographyH3, TypographyMuted } from '@/components/ui/typography';
import { DataTable, type DataTableFilterOption } from '@/components/data-table';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { useAdminUsersQuery, useAdminUserMutations } from '../api/use-admin-users';
import { getUserTableColumns } from './user-table-columns';
import { UserFormSheet } from './user-form-sheet';
import { UserBulkActions } from './user-bulk-actions';
import type {
  AdminUsersSearchParams,
  UserAccountDto,
  UserFormValues,
  UserFormSheetHandle,
} from '../types/admin-users.types';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

export interface AdminUsersViewProps {
  searchParams: AdminUsersSearchParams;
  onNavigateSearch: (updater: (prev: AdminUsersSearchParams) => AdminUsersSearchParams) => void;
}

export function AdminUsersView({ searchParams, onNavigateSearch }: AdminUsersViewProps) {
  const { t } = useTranslation();
  const { user: currentAdmin } = useAuthStore();
  const userSheetRef = useRef<UserFormSheetHandle>(null);

  // TanStack Query & Mutations
  const { data: apiResponse, isLoading, refetch, isFetching } = useAdminUsersQuery(searchParams);
  const { createUserMutation, updateUserMutation, bulkStatusMutation } = useAdminUserMutations();

  const users = apiResponse?.users || [];
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

  // Debounced Search Input State (Isolating volatile search input)
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
        columnId: 'role',
        title: t('admin.users.columns.role'),
        options: [
          { label: t('admin.users.roles.admin'), value: 'admin' },
          { label: t('admin.users.roles.member'), value: 'member' },
        ] as DataTableFilterOption[],
      },
      {
        columnId: 'status',
        title: t('admin.users.columns.status'),
        options: [
          { label: t('admin.users.statuses.active'), value: 'active' },
          { label: t('admin.users.statuses.disabled'), value: 'disabled' },
        ] as DataTableFilterOption[],
      },
    ],
    [t],
  );

  // Column Filters Mapping
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (searchParams.role) {
      filters.push({ id: 'role', value: [searchParams.role] });
    }
    if (searchParams.status) {
      filters.push({ id: 'status', value: [searchParams.status] });
    }
    return filters;
  }, [searchParams.role, searchParams.status]);

  const handleColumnFiltersChange = (newFilters: ColumnFiltersState) => {
    const roleFilter = newFilters.find((f) => f.id === 'role');
    const statusFilter = newFilters.find((f) => f.id === 'status');

    const roleVal = Array.isArray(roleFilter?.value)
      ? (roleFilter?.value[0] as 'admin' | 'member' | undefined)
      : undefined;
    const statusVal = Array.isArray(statusFilter?.value)
      ? (statusFilter?.value[0] as 'active' | 'disabled' | undefined)
      : undefined;

    onNavigateSearch((prev) => ({
      ...prev,
      role: roleVal,
      status: statusVal,
      page: 1,
    }));
  };

  // Sorting State Mapping
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
        sortBy: firstSort.id as 'createdAt' | 'displayName' | 'lastLoginAt' | 'email',
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

  // Handlers for User Actions
  const handleCopyUid = (uid: string) => {
    void navigator.clipboard.writeText(uid);
    toast.success(t('admin.users.toasts.copiedUid', { uid }));
  };

  const handleEditUser = (user: UserAccountDto) => {
    userSheetRef.current?.open(user);
  };

  const handleCreateUser = () => {
    userSheetRef.current?.open(null);
  };

  const handleSaveForm = async (values: UserFormValues, editingUser: UserAccountDto | null) => {
    if (editingUser) {
      await updateUserMutation.mutateAsync({
        uid: editingUser.uid,
        data: values,
      });
    } else {
      await createUserMutation.mutateAsync(values);
    }
  };

  const handleToggleStatusRequest = (user: UserAccountDto) => {
    if (currentAdmin && user.uid === currentAdmin.uid) {
      toast.error(t('admin.users.toasts.selfLockError'));
      return;
    }

    if (user.status === 'active') {
      setConfirmDialog({
        open: true,
        title: t('admin.users.confirm.disableTitle'),
        description: t('admin.users.confirm.disableDesc', { name: user.displayName }),
        confirmLabel: t('admin.users.confirm.disableButton'),
        variant: 'destructive',
        action: async () => {
          await updateUserMutation.mutateAsync({
            uid: user.uid,
            data: { status: 'disabled' },
          });
        },
      });
    } else {
      void updateUserMutation.mutateAsync({
        uid: user.uid,
        data: { status: 'active' },
      });
    }
  };

  const handleToggleRoleRequest = (user: UserAccountDto) => {
    if (currentAdmin && user.uid === currentAdmin.uid) {
      toast.error(t('admin.users.toasts.selfDemoteError'));
      return;
    }

    const nextRole = user.role === 'admin' ? 'member' : 'admin';
    const roleText =
      nextRole === 'admin' ? t('admin.users.roles.admin') : t('admin.users.roles.member');

    setConfirmDialog({
      open: true,
      title: t('admin.users.confirm.changeRoleTitle'),
      description: t('admin.users.confirm.changeRoleDesc', {
        name: user.displayName,
        role: roleText,
      }),
      confirmLabel: t('admin.users.confirm.confirmButton'),
      variant: 'default',
      action: async () => {
        await updateUserMutation.mutateAsync({
          uid: user.uid,
          data: { role: nextRole },
        });
      },
    });
  };

  // Bulk Actions
  const handleBulkActivate = (selectedRows: UserAccountDto[]) => {
    const uids = selectedRows.map((u) => u.uid);
    bulkStatusMutation.mutate({ uids, status: 'active' });
  };

  const handleBulkDisableRequest = (selectedRows: UserAccountDto[]) => {
    let targetUids = selectedRows.map((u) => u.uid);

    if (currentAdmin) {
      const selfIncluded = targetUids.includes(currentAdmin.uid);
      targetUids = targetUids.filter((uid) => uid !== currentAdmin.uid);

      if (targetUids.length === 0) {
        toast.error(t('admin.users.toasts.selfLockError'));
        return;
      }

      if (selfIncluded) {
        toast.info(t('admin.users.toasts.selfExcludedInfo'));
      }
    }

    setConfirmDialog({
      open: true,
      title: t('admin.users.bulk.confirmDisableTitle', { count: targetUids.length }),
      description: t('admin.users.bulk.confirmDisableDesc'),
      confirmLabel: t('admin.users.bulk.confirmDisableButton'),
      variant: 'destructive',
      action: async () => {
        await bulkStatusMutation.mutateAsync({ uids: targetUids, status: 'disabled' });
      },
    });
  };

  // Table Columns
  const columns = useMemo(
    () =>
      getUserTableColumns({
        onEdit: handleEditUser,
        onToggleStatusRequest: handleToggleStatusRequest,
        onToggleRoleRequest: handleToggleRoleRequest,
        onCopyUid: handleCopyUid,
        t,
      }),
    [t, currentAdmin],
  );

  return (
    <div className="flex flex-col h-full w-full space-y-3.5">
      {/* Clean Minimalist Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 shrink-0">
        <div>
          <TypographyH3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            {t('admin.users.title')}
          </TypographyH3>
          <TypographyMuted className="text-xs mt-0.5">{t('admin.users.subtitle')}</TypographyMuted>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8.5 px-3 text-xs gap-1.5 bg-card dark:bg-zinc-900 border-border hover:bg-accent text-foreground shadow-xs font-medium rounded-lg cursor-pointer transition-all active:scale-[0.98]"
          >
            <RefreshCwIcon className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            <span>{t('admin.users.refresh')}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleCreateUser}
            className="h-8.5 px-3.5 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 rounded-lg cursor-pointer transition-all active:scale-[0.98]"
          >
            <UserPlusIcon className="h-3.5 w-3.5" />
            <span>{t('admin.users.createAccount')}</span>
          </Button>
        </div>
      </div>

      {/* Virtual Data Table */}
      <div className="flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          searchPlaceholder={t('admin.users.searchPlaceholder')}
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
            <UserBulkActions
              selectedRows={selectedRows}
              isPending={bulkStatusMutation.isPending}
              onBulkActivate={handleBulkActivate}
              onBulkDisableRequest={handleBulkDisableRequest}
            />
          )}
        />
      </div>

      {/* Slide-out User Form Sheet (React 19 Ref-as-a-prop) */}
      <UserFormSheet
        ref={userSheetRef}
        onSave={handleSaveForm}
        isLoading={updateUserMutation.isPending || createUserMutation.isPending}
      />

      {/* Reusable Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={t('admin.users.confirm.cancel')}
        variant={confirmDialog.variant}
        isLoading={updateUserMutation.isPending || bulkStatusMutation.isPending}
        onConfirm={confirmDialog.action}
      />
    </div>
  );
}
