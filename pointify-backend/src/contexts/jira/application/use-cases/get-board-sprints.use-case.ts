import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JiraTokenManagerService } from '../services/jira-token-manager.service.js';
import { JIRA_GATEWAY, type IJiraGateway } from '../../domain/jira-gateway.interface.js';
import type { JiraSprint } from '../../domain/jira-connection.entity.js';

@Injectable()
export class GetBoardSprintsUseCase {
  constructor(
    private readonly tokenManager: JiraTokenManagerService,
    @Inject(JIRA_GATEWAY)
    private readonly jiraGateway: IJiraGateway,
  ) {}

  async execute(userId: string, cloudId: string, boardId: string): Promise<JiraSprint[]> {
    const connection = await this.tokenManager.getValidConnection(userId);
    try {
      return await this.jiraGateway.getBoardSprints(cloudId, boardId, connection.accessToken);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('401')) {
        try {
          const refreshed = await this.tokenManager.forceRefreshToken(userId);
          return await this.jiraGateway.getBoardSprints(cloudId, boardId, refreshed.accessToken);
        } catch {
          throw new UnauthorizedException(
            'Không thể truy cập danh sách Sprint (401 Unauthorized). Phiên làm việc Jira đã hết hạn hoặc ứng dụng thiếu quyền hạn Jira Software (read:sprint:jira-software). Vui lòng kết nối lại tài khoản Jira trong trang Cá nhân.',
          );
        }
      }
      throw err;
    }
  }
}
