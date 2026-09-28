import { describe, it, expect } from 'vitest';
import { Room } from './room.aggregate.js';
import { Participant } from './entities/participant.entity.js';
import { FacilitatorKey } from './value-objects/facilitator-key.vo.js';
import { StickyNote } from './entities/sticky-note.entity.js';

describe('Room Aggregate - Jira Canvas Sticky Notes', () => {
  function createTestRoom() {
    const facilitatorKey = FacilitatorKey.generate();
    const facilitator = Participant.create('fac_1', {
      displayName: 'Alice Facilitator',
      photoURL: null,
      isGuest: false,
    });

    const stickyNote1 = StickyNote.create('note_1', {
      roomId: 'room_test',
      text: 'Story One Summary',
      color: 'blue',
      position: { x: -650, y: 0 },
      authorId: 'jira-sync',
      authorName: 'Jira Sprint',
      isPinned: true,
      jiraKey: 'PROJ-1',
      jiraUrl: 'https://test.atlassian.net/browse/PROJ-1',
      issueType: 'Story',
      storyPoints: null,
    });

    const stickyNote2 = StickyNote.create('note_2', {
      roomId: 'room_test',
      text: 'Story Two Summary',
      color: 'blue',
      position: { x: -650, y: 210 },
      authorId: 'jira-sync',
      authorName: 'Jira Sprint',
      isPinned: true,
      jiraKey: 'PROJ-2',
      jiraUrl: 'https://test.atlassian.net/browse/PROJ-2',
      issueType: 'Story',
      storyPoints: 3,
    });

    const room = Room.create({
      id: 'room_test',
      name: 'Sprint 42 Planning',
      facilitator,
      facilitatorKey,
      initialStickyNotes: [stickyNote1, stickyNote2],
    });

    return { room, facilitatorKey, facilitator, stickyNote1, stickyNote2 };
  }

  it('should initialize room with Jira canvas sticky notes', () => {
    const { room } = createTestRoom();

    expect(room.stickyNotes.size).toBe(2);
    expect(room.stickyNotes.get('note_1')?.jiraKey).toBe('PROJ-1');
    expect(room.stickyNotes.get('note_1')?.isPinned).toBe(true);
    expect(room.stickyNotes.get('note_2')?.jiraKey).toBe('PROJ-2');
    expect(room.stickyNotes.get('note_2')?.toProjection().storyPoints).toBe(3);
    expect(room.currentRound.linkedJiraIssue?.key).toBe('PROJ-1');
    expect(room.currentRound.topic).toBe('PROJ-1: Story One Summary');
  });

  it('should update story points on matching sticky note when estimate is updated', () => {
    const { room } = createTestRoom();

    room.updateStoryEstimate('PROJ-1', 5);

    expect(room.stickyNotes.get('note_1')?.toProjection().storyPoints).toBe(5);
  });

  it('should update linked Jira issue story points if currently estimating that story', () => {
    const { room, facilitatorKey } = createTestRoom();

    room.startNewRoundWithJira(facilitatorKey.value, '[PROJ-1] Story One Summary', {
      id: '101',
      key: 'PROJ-1',
      summary: 'Story One Summary',
      url: 'https://test.atlassian.net/browse/PROJ-1',
      status: 'estimating',
      currentStoryPoints: null,
    });

    room.updateStoryEstimate('PROJ-1', 8);

    expect(room.currentRound.linkedJiraIssue?.currentStoryPoints).toBe(8);
    expect(room.stickyNotes.get('note_1')?.toProjection().storyPoints).toBe(8);
  });
});
