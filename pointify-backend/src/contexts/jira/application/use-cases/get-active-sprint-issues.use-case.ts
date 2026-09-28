import { Injectable, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JiraTokenManagerService } from '../services/jira-token-manager.service.js';
import { JIRA_GATEWAY, type IJiraGateway } from '../../domain/jira-gateway.interface.js';
import type { JiraIssue, JiraSprint } from '../../domain/jira-connection.entity.js';

export interface ActiveSprintWithIssues {
  sprint: JiraSprint;
  issues: JiraIssue[];
}

@Injectable()
export class GetActiveSprintIssuesUseCase {
  constructor(
    private readonly tokenManager: JiraTokenManagerService,
    @Inject(JIRA_GATEWAY)
    private readonly jiraGateway: IJiraGateway,
  ) {}

  async execute(
    userId: string,
    cloudId: string,
    boardId: string,
  ): Promise<ActiveSprintWithIssues> {
    let connection = await this.tokenManager.getValidConnection(userId);
    try {
      const sprint = await this.jiraGateway.getActiveSprint(
        cloudId,
        boardId,
        connection.accessToken,
      );

      if (!sprint) {
        throw new NotFoundException(
          'Board này hiện không có Sprint nào đang hoạt động (Active Sprint)',
        );
      }

      const issues = await this.jiraGateway.getSprintIssues(
        cloudId,
        sprint.id,
        connection.accessToken,
      );

      return {
        sprint,
        issues,
      };
    } catch (err: unknown) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('401')) {
        try {
          connection = await this.tokenManager.forceRefreshToken(userId);
          const sprint = await this.jiraGateway.getActiveSprint(
            cloudId,
            boardId,
            connection.accessToken,
          );

          if (!sprint) {
            throw new NotFoundException(
              'Board này hiện không có Sprint nào đang hoạt động (Active Sprint)',
            );
          }

          const issues = await this.jiraGateway.getSprintIssues(
            cloudId,
            sprint.id,
            connection.accessToken,
          );

          return {
            sprint,
            issues,
          };
        } catch (innerErr: unknown) {
          if (innerErr instanceof NotFoundException) {
            throw innerErr;
          }
          throw new UnauthorizedException(
            'Không thể truy cập Sprint hoặc User Stories (401 Unauthorized). Phiên làm việc Jira đã hết hạn hoặc ứng dụng thiếu quyền hạn Jira Software (read:sprint:jira-software). Vui lòng kết nối lại tài khoản Jira trong trang Cá nhân.',
          );
        }
      }
      throw err;
    }
  }
}
