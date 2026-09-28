import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { type IRoomRepository, ROOM_REPOSITORY } from '../../domain/room.repository.interface.js';
import { Room, type RoomStoryBacklogItem } from '../../domain/room.aggregate.js';
import { Participant } from '../../domain/entities/participant.entity.js';
import { StickyNote } from '../../domain/entities/sticky-note.entity.js';
import { Deck } from '../../domain/value-objects/deck.vo.js';
import { FacilitatorKey } from '../../domain/value-objects/facilitator-key.vo.js';
import { RoomCode } from '../../domain/value-objects/room-code.vo.js';
import { ok, type Result } from '../../../../shared/domain/result.js';
import type { CreateRoomInputDto, CreateRoomResultDto } from '../dtos/room.dto.js';
import { JIRA_GATEWAY, type IJiraGateway } from '../../../jira/domain/jira-gateway.interface.js';
import { JiraTokenManagerService } from '../../../jira/application/services/jira-token-manager.service.js';

@Injectable()
export class CreateRoomUseCase {
  private readonly logger = new Logger(CreateRoomUseCase.name);

  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Optional()
    @Inject(JIRA_GATEWAY)
    private readonly jiraGateway?: IJiraGateway,
    @Optional()
    private readonly jiraTokenManager?: JiraTokenManagerService,
  ) {}

  async execute(input: CreateRoomInputDto): Promise<Result<CreateRoomResultDto, Error>> {
    let roomId = '';
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
      const candidateCode = RoomCode.generate().value;
      const existing = await this.roomRepository.findById(candidateCode);
      if (!existing) {
        roomId = candidateCode;
        break;
      }
    }

    if (!roomId) {
      roomId = RoomCode.generate().value;
    }

    const facilitatorId = input.facilitator.id || crypto.randomUUID();

    const facilitator = Participant.create(facilitatorId, {
      displayName: input.facilitator.displayName,
      photoURL: input.facilitator.photoURL,
      isGuest: input.facilitator.isGuest ?? true,
      isSpectator: false,
      isOnline: true,
    });

    const deck = Deck.fromType(input.deckType || 'fibonacci', input.customCards);
    const facilitatorKey = FacilitatorKey.generate();

    let initialStickyNotes: StickyNote[] | undefined;
    let storyBacklog: RoomStoryBacklogItem[] | undefined;
    let activeJiraSiteUrl: string | null = null;

    if (
      input.jiraSprintId &&
      input.jiraCloudId &&
      input.facilitator.id &&
      this.jiraGateway &&
      this.jiraTokenManager
    ) {
      try {
        const connection = await this.jiraTokenManager.getValidConnection(input.facilitator.id);
        const site = connection.accessibleResources?.find((s) => s.id === input.jiraCloudId);
        activeJiraSiteUrl = site?.url ? site.url.replace(/\/+$/, '') : null;

        const issues = await this.jiraGateway.getSprintIssues(
          input.jiraCloudId,
          input.jiraSprintId,
          connection.accessToken,
          activeJiraSiteUrl || undefined,
        );

        if (issues && issues.length > 0) {
          const maxRows = 4;
          const colStep = 200;
          const rowStep = 195;
          const startX = -740;
          const startY = -285;

          initialStickyNotes = issues.map((issue, idx) => {
            const col = Math.floor(idx / maxRows);
            const row = idx % maxRows;
            const x = startX - col * colStep;
            const y = startY + row * rowStep;

            const fullJiraUrl = issue.jiraUrl?.startsWith('http')
              ? issue.jiraUrl
              : activeJiraSiteUrl
                ? `${activeJiraSiteUrl}/browse/${issue.key}`
                : `https://atlassian.net/browse/${issue.key}`;

            return StickyNote.create(crypto.randomUUID(), {
              roomId,
              text: issue.summary,
              color: 'blue',
              position: { x, y },
              authorId: facilitatorId,
              authorName: input.facilitator.displayName,
              isPinned: true,
              jiraKey: issue.key,
              jiraUrl: fullJiraUrl,
              issueType: issue.issueType,
              storyPoints: issue.storyPoints,
            });
          });
          storyBacklog = issues.map((issue) => {
            const fullJiraUrl = issue.jiraUrl?.startsWith('http')
              ? issue.jiraUrl
              : activeJiraSiteUrl
                ? `${activeJiraSiteUrl}/browse/${issue.key}`
                : `https://atlassian.net/browse/${issue.key}`;

            return {
              id: issue.id,
              key: issue.key,
              summary: issue.summary,
              issueType: issue.issueType,
              priority: issue.priority,
              status: 'pending',
              estimatedStoryPoints: issue.storyPoints,
              jiraUrl: fullJiraUrl,
              description: issue.description,
              assignee: issue.assignee,
            };
          });
        }
      } catch (err) {
        this.logger.warn(`Failed to import Jira sprint issues for room ${roomId}: ${err}`);
      }
    }

    const room = Room.create({
      id: roomId,
      name: input.name,
      facilitator,
      deck,
      facilitatorKey,
      initialStickyNotes,
      storyBacklog,
      activeJiraSiteUrl,
    });

    await this.roomRepository.save(room);

    return ok({
      room: room.toProjection(facilitatorId),
      facilitatorKey: facilitatorKey.value,
    });
  }
}
