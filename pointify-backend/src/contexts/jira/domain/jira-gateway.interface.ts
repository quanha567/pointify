import type { JiraBoard, JiraCloudSite, JiraIssue, JiraSprint } from './jira-connection.entity.js';

export const JIRA_GATEWAY = Symbol('JIRA_GATEWAY');

export interface AtlassianTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IJiraGateway {
  getAuthorizationUrl(state: string): string;
  exchangeCodeForTokens(code: string): Promise<AtlassianTokens>;
  refreshAccessToken(refreshToken: string): Promise<AtlassianTokens>;
  getAccessibleResources(accessToken: string): Promise<JiraCloudSite[]>;
  getBoards(cloudId: string, accessToken: string): Promise<JiraBoard[]>;
  getBoardSprints(cloudId: string, boardId: string, accessToken: string): Promise<JiraSprint[]>;
  getActiveSprint(cloudId: string, boardId: string, accessToken: string): Promise<JiraSprint | null>;
  getSprintIssues(
    cloudId: string,
    sprintId: string,
    accessToken: string,
    siteUrl?: string,
  ): Promise<JiraIssue[]>;
  updateStoryPoints(
    cloudId: string,
    issueKey: string,
    points: number,
    accessToken: string,
  ): Promise<{ success: boolean; fieldUsed: string }>;
}
