import { Injectable, Inject } from '@nestjs/common';
import { JIRA_GATEWAY, type IJiraGateway } from '../../domain/jira-gateway.interface.js';

@Injectable()
export class GetJiraAuthUrlUseCase {
  constructor(
    @Inject(JIRA_GATEWAY)
    private readonly jiraGateway: IJiraGateway,
  ) {}

  execute(state: string): { url: string } {
    const url = this.jiraGateway.getAuthorizationUrl(state);
    return { url };
  }
}
