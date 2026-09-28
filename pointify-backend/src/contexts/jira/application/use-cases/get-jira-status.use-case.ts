import { Injectable, Inject } from '@nestjs/common';
import {
  JIRA_CONNECTION_REPOSITORY,
  type IJiraConnectionRepository,
} from '../../domain/jira-connection.repository.interface.js';
import type { JiraCloudSite } from '../../domain/jira-connection.entity.js';

export interface JiraStatusOutput {
  isConnected: boolean;
  defaultCloudId: string | null;
  sites: JiraCloudSite[];
  connectedAt?: number;
}

@Injectable()
export class GetJiraStatusUseCase {
  constructor(
    @Inject(JIRA_CONNECTION_REPOSITORY)
    private readonly connectionRepo: IJiraConnectionRepository,
  ) {}

  async execute(userId: string): Promise<JiraStatusOutput> {
    const connection = await this.connectionRepo.findByUserId(userId);
    if (!connection) {
      return {
        isConnected: false,
        defaultCloudId: null,
        sites: [],
      };
    }

    return {
      isConnected: true,
      defaultCloudId: connection.defaultCloudId,
      sites: connection.accessibleResources,
      connectedAt: connection.createdAt,
    };
  }
}
