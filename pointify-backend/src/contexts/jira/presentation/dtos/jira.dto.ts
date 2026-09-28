export interface ConnectAtlassianDto {
  code: string;
}

export interface SyncStoryPointsDto {
  cloudId: string;
  issueKey: string;
  points: number | string;
}

export interface JiraStatusResponseDto {
  isConnected: boolean;
  defaultCloudId: string | null;
  sites: Array<{
    id: string;
    name: string;
    url: string;
    scopes: string[];
    avatarUrl?: string;
  }>;
  connectedAt?: number;
}
