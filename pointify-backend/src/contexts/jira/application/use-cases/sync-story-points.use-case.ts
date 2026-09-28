import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { JiraTokenManagerService } from '../services/jira-token-manager.service.js';
import { JIRA_GATEWAY, type IJiraGateway } from '../../domain/jira-gateway.interface.js';

export interface SyncStoryPointsInput {
  userId: string;
  cloudId: string;
  issueKey: string;
  points: number | string;
}

export interface SyncStoryPointsOutput {
  success: boolean;
  issueKey: string;
  points: number;
  fieldUsed: string;
}

@Injectable()
export class SyncStoryPointsUseCase {
  constructor(
    private readonly tokenManager: JiraTokenManagerService,
    @Inject(JIRA_GATEWAY)
    private readonly jiraGateway: IJiraGateway,
  ) {}

  async execute(input: SyncStoryPointsInput): Promise<SyncStoryPointsOutput> {
    const numPoints = typeof input.points === 'number' ? input.points : parseFloat(input.points);
    if (isNaN(numPoints) || !isFinite(numPoints)) {
      throw new BadRequestException(`Điểm ước lượng '${input.points}' không phải là giá trị số hợp lệ để ghi vào Jira`);
    }

    const connection = await this.tokenManager.getValidConnection(input.userId);
    const result = await this.jiraGateway.updateStoryPoints(
      input.cloudId,
      input.issueKey,
      numPoints,
      connection.accessToken,
    );

    return {
      success: result.success,
      issueKey: input.issueKey,
      points: numPoints,
      fieldUsed: result.fieldUsed,
    };
  }
}
