import { useQuery, useQueryClient, queryOptions, keepPreviousData } from '@tanstack/react-query';
import { fetchAdminOverviewApi } from './admin-overview.api';
import type { TimeRangePreset } from '../types/admin-overview.types';

export const adminOverviewKeys = {
  all: ['admin-overview'] as const,
  overview: (range: TimeRangePreset) => [...adminOverviewKeys.all, range] as const,
};

export const adminOverviewQueries = {
  overview: (range: TimeRangePreset = '30d') =>
    queryOptions({
      queryKey: adminOverviewKeys.overview(range),
      queryFn: () => fetchAdminOverviewApi(range),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),
};

export function useAdminOverviewQuery(range: TimeRangePreset = '30d') {
  return useQuery(adminOverviewQueries.overview(range));
}

export function useInvalidateAdminOverview() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: adminOverviewKeys.all });
  };
}
