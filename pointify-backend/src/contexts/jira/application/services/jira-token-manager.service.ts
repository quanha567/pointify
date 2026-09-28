import { Injectable, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import {
  JIRA_CONNECTION_REPOSITORY,
  type IJiraConnectionRepository,
} from '../../domain/jira-connection.repository.interface.js';
import { JIRA_GATEWAY, type IJiraGateway } from '../../domain/jira-gateway.interface.js';
import type { JiraConnection } from '../../domain/jira-connection.entity.js';

@Injectable()
export class JiraTokenManagerService {
  private readonly logger = new Logger(JiraTokenManagerService.name);

  constructor(
    @Inject(JIRA_CONNECTION_REPOSITORY)
    private readonly connectionRepo: IJiraConnectionRepository,
    @Inject(JIRA_GATEWAY)
    private readonly jiraGateway: IJiraGateway,
  ) {}

  async getValidConnection(userId: string): Promise<JiraConnection> {
    const connection = await this.connectionRepo.findByUserId(userId);
    if (!connection) {
      throw new UnauthorizedException('Tài khoản chưa liên kết với Jira Cloud');
    }

    if (connection.isExpired()) {
      this.logger.debug(`Refreshing expired Jira token for user ${userId}`);
      try {
        const refreshed = await this.jiraGateway.refreshAccessToken(connection.refreshToken);
        connection.updateTokens(refreshed.accessToken, refreshed.refreshToken, refreshed.expiresIn);
        await this.connectionRepo.save(connection);
      } catch (err) {
        this.logger.error(`Failed to refresh token for user ${userId}: ${err}`);
        throw new UnauthorizedException('Phiên đăng nhập Jira đã hết hạn, vui lòng kết nối lại');
      }
    }

    return connection;
  }

  async forceRefreshToken(userId: string): Promise<JiraConnection> {
    const connection = await this.connectionRepo.findByUserId(userId);
    if (!connection) {
      throw new UnauthorizedException('Tài khoản chưa liên kết với Jira Cloud');
    }

    try {
      this.logger.debug(`Force refreshing Jira token for user ${userId}`);
      const refreshed = await this.jiraGateway.refreshAccessToken(connection.refreshToken);
      connection.updateTokens(refreshed.accessToken, refreshed.refreshToken, refreshed.expiresIn);
      await this.connectionRepo.save(connection);
      return connection;
    } catch (err) {
      this.logger.error(`Failed to force refresh token for user ${userId}: ${err}`);
      throw new UnauthorizedException('Phiên đăng nhập Jira đã hết hạn, vui lòng kết nối lại');
    }
  }
}
