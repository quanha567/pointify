import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JiraTokenManagerService } from '../services/jira-token-manager.service.js';
import { JIRA_GATEWAY, type IJiraGateway } from '../../domain/jira-gateway.interface.js';
import type { JiraBoard } from '../../domain/jira-connection.entity.js';

@Injectable()
export class GetJiraBoardsUseCase {
  constructor(
    private readonly tokenManager: JiraTokenManagerService,
    @Inject(JIRA_GATEWAY)
    private readonly jiraGateway: IJiraGateway,
  ) {}

  async execute(userId: string, cloudId: string): Promise<JiraBoard[]> {
    const connection = await this.tokenManager.getValidConnection(userId);
    try {
      return await this.jiraGateway.getBoards(cloudId, connection.accessToken);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('401')) {
        try {
          const refreshed = await this.tokenManager.forceRefreshToken(userId);
          return await this.jiraGateway.getBoards(cloudId, refreshed.accessToken);
        } catch {
          throw new UnauthorizedException(
            'Không thể truy cập danh sách Scrum Board (401 Unauthorized). Phiên làm việc Jira đã hết hạn hoặc ứng dụng thiếu quyền hạn Jira Software (read:board-scope:jira-software). Vui lòng ngắt kết nối và kết nối lại tài khoản Jira trong trang Cá nhân.',
          );
        }
      }
      throw err;
    }
  }
}
