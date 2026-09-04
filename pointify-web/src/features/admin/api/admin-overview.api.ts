import { httpClient } from '@/lib/http-client';
import type { AdminOverviewResponse, TimeRangePreset } from '../types/admin-overview.types';

export async function fetchAdminOverviewApi(
  range: TimeRangePreset = '30d',
): Promise<AdminOverviewResponse> {
  return httpClient.get<AdminOverviewResponse>('/api/admin/overview', {
    params: {
      range,
    },
  });
}
