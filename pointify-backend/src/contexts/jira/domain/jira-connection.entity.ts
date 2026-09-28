import { AggregateRoot } from '../../../shared/domain/aggregate-root.base.js';

export interface JiraCloudSite {
  id: string; // Atlassian Cloud ID
  name: string;
  url: string;
  scopes: string[];
  avatarUrl?: string;
}

export interface JiraBoard {
  id: string;
  name: string;
  type: string; // 'scrum' | 'kanban'
}

export interface JiraSprint {
  id: string;
  name: string;
  state: 'active' | 'future' | 'closed';
  startDate?: string;
  endDate?: string;
  goal?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  issueType: string;
  priority: string;
  status: string;
  storyPoints: number | null;
  jiraUrl: string;
  description?: string | null;
  assignee?: { displayName: string; avatarUrl?: string } | null;
  sprintName?: string | null;
}

export interface JiraConnectionProps {
  userId: string;
  atlassianUserId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp in ms
  accessibleResources: JiraCloudSite[];
  defaultCloudId: string | null;
  createdAt: number;
  updatedAt: number;
}

export class JiraConnection extends AggregateRoot<JiraConnectionProps, string> {
  private constructor(userId: string, props: JiraConnectionProps) {
    super(userId, props);
  }

  public static create(params: {
    userId: string;
    atlassianUserId: string;
    accessToken: string;
    refreshToken: string;
    expiresInSeconds: number;
    accessibleResources: JiraCloudSite[];
    defaultCloudId?: string | null;
  }): JiraConnection {
    const now = Date.now();
    return new JiraConnection(params.userId, {
      userId: params.userId,
      atlassianUserId: params.atlassianUserId,
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      expiresAt: now + params.expiresInSeconds * 1000,
      accessibleResources: params.accessibleResources,
      defaultCloudId: params.defaultCloudId ?? params.accessibleResources[0]?.id ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstruct(userId: string, props: JiraConnectionProps): JiraConnection {
    return new JiraConnection(userId, props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get atlassianUserId(): string {
    return this.props.atlassianUserId;
  }

  get accessToken(): string {
    return this.props.accessToken;
  }

  get refreshToken(): string {
    return this.props.refreshToken;
  }

  get expiresAt(): number {
    return this.props.expiresAt;
  }

  get accessibleResources(): JiraCloudSite[] {
    return [...this.props.accessibleResources];
  }

  get defaultCloudId(): string | null {
    return this.props.defaultCloudId;
  }

  get createdAt(): number {
    return this.props.createdAt;
  }

  get updatedAt(): number {
    return this.props.updatedAt;
  }

  public isExpired(bufferSeconds = 60): boolean {
    return Date.now() >= this.props.expiresAt - bufferSeconds * 1000;
  }

  public updateTokens(accessToken: string, refreshToken: string, expiresInSeconds: number): void {
    this.props.accessToken = accessToken;
    this.props.refreshToken = refreshToken;
    this.props.expiresAt = Date.now() + expiresInSeconds * 1000;
    this.props.updatedAt = Date.now();
  }

  public updateAccessibleResources(resources: JiraCloudSite[]): void {
    this.props.accessibleResources = resources;
    if (!this.props.defaultCloudId && resources.length > 0 && resources[0]) {
      this.props.defaultCloudId = resources[0].id;
    }
    this.props.updatedAt = Date.now();
  }

  public setDefaultCloudId(cloudId: string): void {
    const exists = this.props.accessibleResources.some((site) => site.id === cloudId);
    if (exists) {
      this.props.defaultCloudId = cloudId;
      this.props.updatedAt = Date.now();
    }
  }
}
