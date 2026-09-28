import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
  keepPreviousData,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  fetchAdminRoomsApi,
  fetchAdminRoomDetailApi,
  closeAdminRoomApi,
  takeoverAdminRoomApi,
  deleteAdminRoomApi,
  bulkCloseRoomsApi,
  bulkDeleteRoomsApi,
} from './admin-rooms.api';
import type { AdminRoomsSearchParams } from '../types/admin-rooms.types';

export const adminRoomKeys = {
  all: ['admin-rooms'] as const,
  lists: () => [...adminRoomKeys.all, 'list'] as const,
  list: (params: AdminRoomsSearchParams) => [...adminRoomKeys.lists(), params] as const,
  details: () => [...adminRoomKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminRoomKeys.details(), id] as const,
};

export const adminRoomQueries = {
  list: (params: AdminRoomsSearchParams) =>
    queryOptions({
      queryKey: adminRoomKeys.list(params),
      queryFn: () => fetchAdminRoomsApi(params),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 30, // 30 seconds
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: adminRoomKeys.detail(id),
      queryFn: () => fetchAdminRoomDetailApi(id),
      enabled: Boolean(id),
      staleTime: 1000 * 20,
    }),
};

export function useAdminRoomsQuery(params: AdminRoomsSearchParams) {
  return useQuery(adminRoomQueries.list(params));
}

export function useAdminRoomDetailQuery(roomId: string | null) {
  return useQuery({
    ...adminRoomQueries.detail(roomId || ''),
    enabled: Boolean(roomId),
  });
}

export function useCloseRoomMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('admin');

  return useMutation({
    mutationFn: (id: string) => closeAdminRoomApi(id),
    onSuccess: () => {
      toast.success(t('admin.rooms.toasts.closedSuccess', 'Đã đóng phòng ước lượng'));
      void queryClient.invalidateQueries({ queryKey: adminRoomKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err?.message || t('admin.rooms.toasts.error', 'Có lỗi xảy ra'));
    },
  });
}

export function useTakeoverRoomMutation() {
  const { t } = useTranslation('admin');

  return useMutation({
    mutationFn: (id: string) => takeoverAdminRoomApi(id),
    onError: (err: Error) => {
      toast.error(
        err?.message ||
          t('admin.rooms.toasts.takeoverError', 'Không thể tiếp quản quyền điều phối'),
      );
    },
  });
}

export function useDeleteRoomMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('admin');

  return useMutation({
    mutationFn: (id: string) => deleteAdminRoomApi(id),
    onSuccess: () => {
      toast.success(t('admin.rooms.toasts.deletedSuccess', 'Đã xóa phòng ước lượng'));
      void queryClient.invalidateQueries({ queryKey: adminRoomKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err?.message || t('admin.rooms.toasts.error', 'Có lỗi xảy ra'));
    },
  });
}

export function useBulkCloseRoomsMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('admin');

  return useMutation({
    mutationFn: (ids: string[]) => bulkCloseRoomsApi(ids),
    onSuccess: (res) => {
      toast.success(
        t('admin.rooms.toasts.bulkClosedSuccess', {
          count: res.count,
          defaultValue: `Đã đóng ${res.count} phòng ước lượng`,
        }),
      );
      void queryClient.invalidateQueries({ queryKey: adminRoomKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err?.message || t('admin.rooms.toasts.error', 'Có lỗi xảy ra'));
    },
  });
}

export function useBulkDeleteRoomsMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('admin');

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteRoomsApi(ids),
    onSuccess: (res) => {
      toast.success(
        t('admin.rooms.toasts.bulkDeletedSuccess', {
          count: res.count,
          defaultValue: `Đã xóa ${res.count} phòng ước lượng`,
        }),
      );
      void queryClient.invalidateQueries({ queryKey: adminRoomKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err?.message || t('admin.rooms.toasts.error', 'Có lỗi xảy ra'));
    },
  });
}
