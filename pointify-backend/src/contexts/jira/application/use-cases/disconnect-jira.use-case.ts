import { Injectable, Inject } from '@nestjs/common';
import {
  JIRA_CONNECTION_REPOSITORY,
  type IJiraConnectionRepository,
} from '../../domain/jira-connection.repository.interface.js';

@Injectable()
export class DisconnectJiraUseCase {
  constructor(
    @Inject(JIRA_CONNECTION_REPOSITORY)
    private readonly connectionRepo: IJiraConnectionRepository,
  ) {}

  async execute(userId: string): Promise<{ success: boolean }> {
    await this.connectionRepo.deleteByUserId(userId);
    return { success: true };
  }
}
