import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import '@fastify/cookie';
import {
  type IAuthService,
  AUTH_SERVICE,
} from '../../../identity/application/services/auth-service.interface.js';
import { GetJiraAuthUrlUseCase } from '../../application/use-cases/get-jira-auth-url.use-case.js';
import { ConnectAtlassianUseCase } from '../../application/use-cases/connect-atlassian.use-case.js';
import { GetJiraStatusUseCase } from '../../application/use-cases/get-jira-status.use-case.js';
import { DisconnectJiraUseCase } from '../../application/use-cases/disconnect-jira.use-case.js';
import { GetJiraBoardsUseCase } from '../../application/use-cases/get-jira-boards.use-case.js';
import { GetBoardSprintsUseCase } from '../../application/use-cases/get-board-sprints.use-case.js';
import { GetActiveSprintIssuesUseCase } from '../../application/use-cases/get-active-sprint-issues.use-case.js';
import { SyncStoryPointsUseCase } from '../../application/use-cases/sync-story-points.use-case.js';
import type { ConnectAtlassianDto, SyncStoryPointsDto } from '../dtos/jira.dto.js';

@ApiTags('Jira')
@ApiBearerAuth('bearer')
@ApiCookieAuth('cookie')
@Controller('api/jira')
export class JiraController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    private readonly getJiraAuthUrlUseCase: GetJiraAuthUrlUseCase,
    private readonly connectAtlassianUseCase: ConnectAtlassianUseCase,
    private readonly getJiraStatusUseCase: GetJiraStatusUseCase,
    private readonly disconnectJiraUseCase: DisconnectJiraUseCase,
    private readonly getJiraBoardsUseCase: GetJiraBoardsUseCase,
    private readonly getBoardSprintsUseCase: GetBoardSprintsUseCase,
    private readonly getActiveSprintIssuesUseCase: GetActiveSprintIssuesUseCase,
    private readonly syncStoryPointsUseCase: SyncStoryPointsUseCase,
  ) {}

  private async getUidFromRequest(req: FastifyRequest): Promise<string> {
    const sessionCookie = req.cookies?.__session;
    const authHeader = req.headers.authorization;

    let idToken = '';
    if (authHeader?.startsWith('Bearer ')) {
      idToken = authHeader.substring(7);
    } else if (sessionCookie) {
      idToken = sessionCookie;
    }

    if (!idToken) {
      throw new UnauthorizedException('No authentication session found');
    }

    try {
      const decoded = await this.authService.verifyIdToken(idToken);
      return decoded.uid;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication session');
    }
  }

  @Get('oauth/url')
  @ApiOperation({ summary: 'Generate Atlassian OAuth 2.0 authorization URL' })
  getAuthUrl(@Query('state') state = 'default_state') {
    return this.getJiraAuthUrlUseCase.execute(state);
  }

  @Post('oauth/callback')
  @ApiOperation({ summary: 'Exchange Atlassian OAuth code for tokens' })
  async handleCallback(@Req() req: FastifyRequest, @Body() body: ConnectAtlassianDto) {
    const uid = await this.getUidFromRequest(req);
    return this.connectAtlassianUseCase.execute({
      userId: uid,
      code: body.code,
    });
  }

  @Get('status')
  @ApiOperation({ summary: 'Get Jira connection status for current user' })
  async getStatus(@Req() req: FastifyRequest) {
    const uid = await this.getUidFromRequest(req);
    return this.getJiraStatusUseCase.execute(uid);
  }

  private readonly logger = new Logger(JiraController.name);

  @Delete('disconnect')
  @ApiOperation({ summary: 'Disconnect Jira connection for current user' })
  async disconnect(@Req() req: FastifyRequest) {
    try {
      const uid = await this.getUidFromRequest(req);
      this.logger.log(`Disconnecting Jira for user (DELETE): ${uid}`);
      const result = await this.disconnectJiraUseCase.execute(uid);
      this.logger.log(`Successfully disconnected Jira for user: ${uid}`);
      return result;
    } catch (err: any) {
      this.logger.error(`Failed to disconnect Jira: ${err?.message || err}`, err?.stack);
      throw err;
    }
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Disconnect Jira connection for current user (POST fallback)' })
  async disconnectPost(@Req() req: FastifyRequest) {
    try {
      const uid = await this.getUidFromRequest(req);
      this.logger.log(`Disconnecting Jira for user (POST): ${uid}`);
      const result = await this.disconnectJiraUseCase.execute(uid);
      this.logger.log(`Successfully disconnected Jira for user: ${uid}`);
      return result;
    } catch (err: any) {
      this.logger.error(`Failed to disconnect Jira: ${err?.message || err}`, err?.stack);
      throw err;
    }
  }

  @Get('sites/:cloudId/boards')
  @ApiOperation({ summary: 'Get Jira Software boards for a cloud site' })
  async getBoards(@Req() req: FastifyRequest, @Param('cloudId') cloudId: string) {
    const uid = await this.getUidFromRequest(req);
    return this.getJiraBoardsUseCase.execute(uid, cloudId);
  }

  @Get('sites/:cloudId/boards/:boardId/sprints')
  @ApiOperation({ summary: 'Get Jira sprints (active and future) for a board' })
  async getBoardSprints(
    @Req() req: FastifyRequest,
    @Param('cloudId') cloudId: string,
    @Param('boardId') boardId: string,
  ) {
    const uid = await this.getUidFromRequest(req);
    return this.getBoardSprintsUseCase.execute(uid, cloudId, boardId);
  }

  @Get('sites/:cloudId/boards/:boardId/active-sprint/issues')
  @ApiOperation({ summary: 'Get active sprint and its user stories for a board' })
  async getActiveSprintIssues(
    @Req() req: FastifyRequest,
    @Param('cloudId') cloudId: string,
    @Param('boardId') boardId: string,
  ) {
    const uid = await this.getUidFromRequest(req);
    return this.getActiveSprintIssuesUseCase.execute(uid, cloudId, boardId);
  }

  @Post('sync-points')
  @ApiOperation({ summary: 'Sync consensus story points back to Jira issue' })
  async syncStoryPoints(@Req() req: FastifyRequest, @Body() body: SyncStoryPointsDto) {
    const uid = await this.getUidFromRequest(req);
    return this.syncStoryPointsUseCase.execute({
      userId: uid,
      cloudId: body.cloudId,
      issueKey: body.issueKey,
      points: body.points,
    });
  }
}
