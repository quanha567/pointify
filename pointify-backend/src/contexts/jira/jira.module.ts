import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../firebase/firebase.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { JIRA_CONNECTION_REPOSITORY } from './domain/jira-connection.repository.interface.js';
import { JIRA_GATEWAY } from './domain/jira-gateway.interface.js';
import { FirestoreJiraConnectionRepository } from './infrastructure/repositories/firestore-jira-connection.repository.js';
import { AtlassianOAuthClient } from './infrastructure/clients/atlassian-oauth.client.js';
import { JiraTokenManagerService } from './application/services/jira-token-manager.service.js';
import { GetJiraAuthUrlUseCase } from './application/use-cases/get-jira-auth-url.use-case.js';
import { ConnectAtlassianUseCase } from './application/use-cases/connect-atlassian.use-case.js';
import { GetJiraStatusUseCase } from './application/use-cases/get-jira-status.use-case.js';
import { DisconnectJiraUseCase } from './application/use-cases/disconnect-jira.use-case.js';
import { GetJiraBoardsUseCase } from './application/use-cases/get-jira-boards.use-case.js';
import { GetBoardSprintsUseCase } from './application/use-cases/get-board-sprints.use-case.js';
import { GetActiveSprintIssuesUseCase } from './application/use-cases/get-active-sprint-issues.use-case.js';
import { SyncStoryPointsUseCase } from './application/use-cases/sync-story-points.use-case.js';
import { JiraController } from './presentation/controllers/jira.controller.js';

@Module({
  imports: [FirebaseModule, IdentityModule],
  controllers: [JiraController],
  providers: [
    {
      provide: JIRA_CONNECTION_REPOSITORY,
      useClass: FirestoreJiraConnectionRepository,
    },
    {
      provide: JIRA_GATEWAY,
      useClass: AtlassianOAuthClient,
    },
    JiraTokenManagerService,
    GetJiraAuthUrlUseCase,
    ConnectAtlassianUseCase,
    GetJiraStatusUseCase,
    DisconnectJiraUseCase,
    GetJiraBoardsUseCase,
    GetBoardSprintsUseCase,
    GetActiveSprintIssuesUseCase,
    SyncStoryPointsUseCase,
  ],
  exports: [
    JIRA_GATEWAY,
    JIRA_CONNECTION_REPOSITORY,
    JiraTokenManagerService,
    GetBoardSprintsUseCase,
    SyncStoryPointsUseCase,
  ],
})
export class JiraModule {}
