import { z } from 'zod';

export type TimeRangePreset = '7d' | '30d' | '90d' | 'all';

export const adminOverviewSearchSchema = z.object({
  range: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
});

export type AdminOverviewSearchParams = z.infer<typeof adminOverviewSearchSchema>;

export interface OverviewSummary {
  totalAccounts: number;
  activeAccounts: number;
  disabledAccounts: number;
  totalRooms: number;
  activeRooms: number;
  totalRounds: number;
  totalEstimates: number;
}

export interface ActivityTrendItem {
  date: string;
  accounts: number;
  rooms: number;
  rounds: number;
}

export interface DeckDistributionItem {
  deckType: string;
  count: number;
  percentage: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'user_registered' | 'room_created';
  title: string;
  subtitle: string;
  timestamp: number;
}

export interface AdminOverviewResponse {
  success: boolean;
  summary: OverviewSummary;
  trends: ActivityTrendItem[];
  deckDistribution: DeckDistributionItem[];
  recentActivities: RecentActivityItem[];
}
