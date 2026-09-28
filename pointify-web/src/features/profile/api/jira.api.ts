import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/lib/http-client';

export interface JiraCloudSite {
  id: string;
  name: string;
  url: string;
  scopes: string[];
  avatarUrl?: string;
}

export interface JiraBoard {
  id: string;
  name: string;
  type: string;
}

export interface JiraSprint {
  id: string;
  name: string;
  state: 'active' | 'future' | 'closed';
  startDate?: string;
  endDate?: string;
  goal?: string;
}

export interface JiraIssueDto {
  id: string;
  key: string;
  summary: string;
  issueType: string;
  priority: string;
  status: string;
  storyPoints: number | null;
  jiraUrl: string;
}

export interface JiraStatusDto {
  isConnected: boolean;
  defaultCloudId: string | null;
  sites: JiraCloudSite[];
  connectedAt?: number;
}

export const jiraKeys = {
  all: ['jira'] as const,
  status: () => [...jiraKeys.all, 'status'] as const,
  boards: (cloudId?: string) => [...jiraKeys.all, 'boards', cloudId] as const,
  sprints: (cloudId?: string, boardId?: string) =>
    [...jiraKeys.all, 'sprints', cloudId, boardId] as const,
  sprintIssues: (cloudId?: string, boardId?: string) =>
    [...jiraKeys.all, 'sprintIssues', cloudId, boardId] as const,
};

/* ── API Methods ────────────────────────────────────────────── */

export async function getJiraAuthUrlApi(state?: string): Promise<{ url: string }> {
  return httpClient.get<{ url: string }>('/api/jira/oauth/url', {
    params: state ? { state } : undefined,
  });
}

export async function connectAtlassianCallbackApi(
  code: string,
): Promise<{ success: boolean; sites: JiraCloudSite[]; defaultCloudId: string | null }> {
  return httpClient.post('/api/jira/oauth/callback', { code });
}

export async function getJiraStatusApi(): Promise<JiraStatusDto> {
  return httpClient.get<JiraStatusDto>('/api/jira/status');
}

export async function disconnectJiraApi(): Promise<{ success: boolean }> {
  try {
    return await httpClient.delete<{ success: boolean }>('/api/jira/disconnect');
  } catch {
    return await httpClient.post<{ success: boolean }>('/api/jira/disconnect', {});
  }
}

export async function getJiraBoardsApi(cloudId: string): Promise<JiraBoard[]> {
  return httpClient.get<JiraBoard[]>(`/api/jira/sites/${encodeURIComponent(cloudId)}/boards`);
}

export async function getJiraSprintsApi(cloudId: string, boardId: string): Promise<JiraSprint[]> {
  return httpClient.get<JiraSprint[]>(
    `/api/jira/sites/${encodeURIComponent(cloudId)}/boards/${encodeURIComponent(boardId)}/sprints`,
  );
}

export async function getActiveSprintIssuesApi(
  cloudId: string,
  boardId: string,
): Promise<{ sprint: JiraSprint; issues: JiraIssueDto[] }> {
  return httpClient.get<{ sprint: JiraSprint; issues: JiraIssueDto[] }>(
    `/api/jira/sites/${encodeURIComponent(cloudId)}/boards/${encodeURIComponent(boardId)}/active-sprint/issues`,
  );
}

export async function syncStoryPointsApi(payload: {
  cloudId: string;
  issueKey: string;
  points: number | string;
}): Promise<{ success: boolean; issueKey: string; points: number; fieldUsed: string }> {
  return httpClient.post('/api/jira/sync-points', payload);
}

/* ── TanStack Query Hooks ───────────────────────────────────── */

export function useJiraStatus(enabled = true) {
  return useQuery({
    queryKey: jiraKeys.status(),
    queryFn: getJiraStatusApi,
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useJiraBoards(cloudId?: string) {
  return useQuery({
    queryKey: jiraKeys.boards(cloudId),
    queryFn: () => getJiraBoardsApi(cloudId!),
    enabled: Boolean(cloudId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useJiraSprints(cloudId?: string, boardId?: string) {
  return useQuery({
    queryKey: jiraKeys.sprints(cloudId, boardId),
    queryFn: () => getJiraSprintsApi(cloudId!, boardId!),
    enabled: Boolean(cloudId && boardId),
    staleTime: 60 * 1000,
  });
}

export function useActiveSprintIssues(cloudId?: string, boardId?: string) {
  return useQuery({
    queryKey: jiraKeys.sprintIssues(cloudId, boardId),
    queryFn: () => getActiveSprintIssuesApi(cloudId!, boardId!),
    enabled: Boolean(cloudId && boardId),
    staleTime: 60 * 1000,
  });
}

export function useJiraConnectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => connectAtlassianCallbackApi(code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jiraKeys.all });
    },
  });
}

export function useJiraDisconnectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectJiraApi,
    onSuccess: () => {
      queryClient.setQueryData(jiraKeys.status(), {
        isConnected: false,
        defaultCloudId: null,
        sites: [],
      });
      void queryClient.invalidateQueries({ queryKey: jiraKeys.all });
    },
  });
}

export function useSyncStoryPointsMutation() {
  return useMutation({
    mutationFn: syncStoryPointsApi,
  });
}
