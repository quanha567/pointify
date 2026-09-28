import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  JIRA_CONNECTION_REPOSITORY,
  type IJiraConnectionRepository,
} from '../../domain/jira-connection.repository.interface.js';
import { JIRA_GATEWAY, type IJiraGateway } from '../../domain/jira-gateway.interface.js';
import { JiraConnection, type JiraCloudSite } from '../../domain/jira-connection.entity.js';

export interface ConnectAtlassianInput {
  userId: string;
  code: string;
}

export interface ConnectAtlassianOutput {
  success: boolean;
  sites: JiraCloudSite[];
  defaultCloudId: string | null;
}

@Injectable()
export class ConnectAtlassianUseCase {
  constructor(
    @Inject(JIRA_CONNECTION_REPOSITORY)
    private readonly connectionRepo: IJiraConnectionRepository,
    @Inject(JIRA_GATEWAY)
    private readonly jiraGateway: IJiraGateway,
  ) {}

  async execute(input: ConnectAtlassianInput): Promise<ConnectAtlassianOutput> {
    if (!input.code) {
      throw new BadRequestException('Authorization code is required');
    }

    // 1. Exchange code for access & refresh tokens
    const tokens = await this.jiraGateway.exchangeCodeForTokens(input.code);

    // 2. Fetch accessible resources
    const sites = await this.jiraGateway.getAccessibleResources(tokens.accessToken);
    if (sites.length === 0) {
      throw new BadRequestException('Tài khoản Atlassian không có quyền truy cập trang Jira Cloud nào');
    }

    // 3. Create or update JiraConnection aggregate
    const connection = JiraConnection.create({
      userId: input.userId,
      atlassianUserId: '',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresInSeconds: tokens.expiresIn,
      accessibleResources: sites,
      defaultCloudId: sites[0]?.id || null,
    });

    await this.connectionRepo.save(connection);

    return {
      success: true,
      sites: connection.accessibleResources,
      defaultCloudId: connection.defaultCloudId,
    };
  }
}
