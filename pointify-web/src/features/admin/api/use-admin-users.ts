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
  fetchAdminUsersApi,
  createAdminUserApi,
  updateAdminUserApi,
  bulkUpdateUserStatusApi,
} from './admin-users.api';
import type { AdminUsersSearchParams, UserFormValues } from '../types/admin-users.types';

export const adminUserKeys = {
  all: ['admin-users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (params: AdminUsersSearchParams) => [...adminUserKeys.lists(), params] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (uid: string) => [...adminUserKeys.details(), uid] as const,
};

export const adminUserQueries = {
  list: (params: AdminUsersSearchParams) =>
    queryOptions({
      queryKey: adminUserKeys.list(params),
      queryFn: () => fetchAdminUsersApi(params),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 60,
    }),
};

export function useAdminUsersQuery(params: AdminUsersSearchParams) {
  return useQuery(adminUserQueries.list(params));
}

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('admin');

  return useMutation({
    mutationFn: (values: UserFormValues) =>
      createAdminUserApi({
        email: values.email,
        displayName: values.displayName,
        photoURL: values.photoURL || null,
        role: values.role,
        status: values.status,
      }),
    onSuccess: (res) => {
      toast.success(t('admin.users.toasts.createdSuccess', { name: res.user.displayName }));
      void queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
    onError: (err: Error) => {
      toast.error(err?.message || t('admin.users.toasts.saveError'));
    },
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('admin');

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<UserFormValues> }) =>
      updateAdminUserApi(uid, {
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role,
        status: data.status,
      }),
    onSuccess: (res) => {
      toast.success(t('admin.users.toasts.updatedSuccess', { name: res.user.displayName }));
      void queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
    onError: (err: Error) => {
      toast.error(err?.message || t('admin.users.toasts.saveError'));
    },
  });
}

export function useBulkUpdateStatusMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('admin');

  return useMutation({
    mutationFn: ({ uids, status }: { uids: string[]; status: 'active' | 'disabled' }) =>
      bulkUpdateUserStatusApi(uids, status),
    onSuccess: (res, vars) => {
      if (vars.status === 'active') {
        toast.success(t('admin.users.toasts.bulkActivated', { count: res.updatedCount }));
      } else {
        toast.success(t('admin.users.toasts.bulkDisabled', { count: res.updatedCount }));
      }
      void queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
    onError: (err: Error) => {
      toast.error(err?.message || t('admin.users.toasts.bulkError'));
    },
  });
}

export function useAdminUserMutations() {
  const createUserMutation = useCreateAdminUserMutation();
  const updateUserMutation = useUpdateAdminUserMutation();
  const bulkStatusMutation = useBulkUpdateStatusMutation();
  const queryClient = useQueryClient();

  const invalidateUsers = () => {
    void queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
  };

  return {
    createUserMutation,
    updateUserMutation,
    bulkStatusMutation,
    invalidateUsers,
  };
}
