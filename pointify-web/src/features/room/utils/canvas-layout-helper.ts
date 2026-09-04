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
} as const;

/**
 * Calculates positions and generates React Flow nodes for table and participants
 */
export function generateRoomNodes(room: RoomProjection, currentUserId?: string): Node[] {
  const nodes: Node[] = [];

  // 1. Center Table Arena Node (600x320px, center at (0, 0))
  nodes.push({
    id: 'table-arena-node',
    type: NODE_TYPES.TABLE_ARENA,
    position: { x: -300, y: -160 },
    data: {
      room,
    },
    draggable: false,
    selectable: false,
  });

  const estimators = room.participants.filter((p) => !p.isSpectator);
  const spectators = room.participants.filter((p) => p.isSpectator);

  // 2. Compute ellipse coordinates for Estimator Participants
  // Table half-size is 300×160; orbit must clear it + participant node (~56×100)
  const count = estimators.length;
  if (count > 0) {
    const rx = Math.max(440, 360 + count * 24);
    const ry = Math.max(280, 220 + count * 16);

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
      });
    });
  }

  return nodes;
}
