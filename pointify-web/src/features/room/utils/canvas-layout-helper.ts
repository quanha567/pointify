import type { Node } from '@xyflow/react';
import type { ParticipantProjection, RoomProjection } from '../types/room.types';

export interface CanvasNodeData extends Record<string, unknown> {
  room?: RoomProjection;
  participant?: ParticipantProjection;
  isCurrentUser?: boolean;
}

export const NODE_TYPES = {
  TABLE_ARENA: 'tableArena',
  PARTICIPANT: 'participant',
  SPECTATOR: 'spectator',
  STICKY_NOTE: 'stickyNote',
} as const;

/**
 * Calculates positions and generates React Flow nodes for table and participants
 */
export function generateRoomNodes(
  room: RoomProjection,
  currentUserId?: string,
  isFacilitator?: boolean,
): Node[] {
  const nodes: Node[] = [];
  const effectiveIsFacilitator = isFacilitator ?? room.facilitatorId === currentUserId;

  // 1. Center Table Arena Node (620x340px, center at (0, 0))
  nodes.push({
    id: 'table-arena-node',
    type: NODE_TYPES.TABLE_ARENA,
    position: { x: -310, y: -170 },
    data: {
      room,
    },
    draggable: false,
    selectable: false,
  });

  const estimators = room.participants.filter((p) => !p.isSpectator);
  const spectators = room.participants.filter((p) => p.isSpectator);

  // 2. Compute ellipse coordinates for Estimator Participants
  // Table half-size is 310×170; orbit must clear it + participant node (~64×110)
  const count = estimators.length;
  if (count > 0) {
    const rx = Math.max(450, 370 + count * 24);
    const ry = Math.max(290, 230 + count * 16);

    estimators.forEach((participant, index) => {
      // Distribute evenly along ellipse, starting from bottom
      const angle = (2 * Math.PI * index) / count + Math.PI / 2;
      const x = Math.round(rx * Math.cos(angle)) - 28;
      const y = Math.round(ry * Math.sin(angle)) - 50;

      nodes.push({
        id: `participant-${participant.id}`,
        type: NODE_TYPES.PARTICIPANT,
        position: { x, y },
        data: {
          participant,
          roundStatus: room.currentRound.status,
          isCurrentUser: currentUserId === participant.id,
        },
        draggable: false,
        selectable: false,
      });
    });
  }

  // 3. Position Spectators in a top horizontal row
  if (spectators.length > 0) {
    const spectatorSpacing = 150;
    const startX = -((spectators.length - 1) * spectatorSpacing) / 2;
    const topY = -300;

    spectators.forEach((spectator, idx) => {
      nodes.push({
        id: `spectator-${spectator.id}`,
        type: NODE_TYPES.SPECTATOR,
        position: { x: startX + idx * spectatorSpacing - 60, y: topY },
        data: {
          participant: spectator,
          isCurrentUser: currentUserId === spectator.id,
        },
        draggable: false,
        selectable: false,
      });
    });
  }

  // 4. Generate Sticky Note Nodes (only free collaborative notes; Jira User Stories are housed in StoryBacklogDrawer)
  if (room.stickyNotes && room.stickyNotes.length > 0) {
    const isJiraStoryNote = (n: (typeof room.stickyNotes)[0]) =>
      Boolean(n.jiraKey || n.text?.trim().match(/^[A-Z][A-Z0-9]+-\d+/i));

    const generalNotes = room.stickyNotes.filter((note) => !isJiraStoryNote(note));

    generalNotes.forEach((note) => {
      nodes.push({
        id: `sticky-note-${note.id}`,
        type: NODE_TYPES.STICKY_NOTE,
        position: { x: note.position.x, y: note.position.y },
        data: {
          note,
          currentUserId,
          isCurrentAuthor: currentUserId === note.authorId,
          isFacilitator: effectiveIsFacilitator,
          roomId: room.id,
          isEstimating: false,
        },
        draggable: true,
        selectable: true,
      });
    });
  }

  return nodes;
}
