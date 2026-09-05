import { useMemo, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useReactFlow,
  ReactFlowProvider,
  type OnNodeDrag,
  type OnNodesChange,
} from '@xyflow/react';
import { TableArenaNode } from './table-arena-node';
import { ParticipantNode } from './participant-node';
import { SpectatorNode } from './spectator-node';
import { StickyNoteNode } from './sticky-note-node';
import { StickyNoteStack } from '../hud/sticky-note-stack';
import {
  StickyNotesContext,
  useStickyNotes,
  type StickyNotesContextValue,
} from '../../context/sticky-notes-context';
import { generateRoomNodes, NODE_TYPES } from '../../utils/canvas-layout-helper';
import type { RoomProjection, StickyNoteColor } from '../../types/room.types';

const nodeTypes = {
  [NODE_TYPES.TABLE_ARENA]: TableArenaNode,
  [NODE_TYPES.PARTICIPANT]: ParticipantNode,
  [NODE_TYPES.SPECTATOR]: SpectatorNode,
  [NODE_TYPES.STICKY_NOTE]: StickyNoteNode,
};

interface RoomCanvasContentProps {
  room: RoomProjection;
  currentUserId?: string;
}

function RoomCanvasContent({ room, currentUserId }: RoomCanvasContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingNoteIdRef = useRef<string | null>(null);
  const { fitView, screenToFlowPosition } = useReactFlow();
  const { moveStickyNote, createStickyNote } = useStickyNotes();

  const initialNodes = useMemo(() => generateRoomNodes(room, currentUserId), [room, currentUserId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // Clamp coordinates within the visible safe viewport area to prevent dragging out of frame
  const clampToViewport = useCallback(
    (pos: { x: number; y: number }): { x: number; y: number } => {
      const container = containerRef.current;
      const width = container?.clientWidth || window.innerWidth;
      const height = container?.clientHeight || window.innerHeight;

      // Safe bounds: 16px horizontal margins, 76px from top (header), 130px from bottom (dock)
      // Note size: ~170px width, ~170px height
      const minPoint = screenToFlowPosition({ x: 16, y: 76 });
      const maxPoint = screenToFlowPosition({
        x: Math.max(16, width - 170 - 16),
        y: Math.max(76, height - 170 - 130),
      });

      // Guard against non-finite coordinates if viewport is unmounted or in transition
      if (
        !Number.isFinite(minPoint.x) ||
        !Number.isFinite(minPoint.y) ||
        !Number.isFinite(maxPoint.x) ||
        !Number.isFinite(maxPoint.y)
      ) {
        return pos;
      }

      const minX = Math.min(minPoint.x, maxPoint.x);
      const maxX = Math.max(minPoint.x, maxPoint.x);
      const minY = Math.min(minPoint.y, maxPoint.y);
      const maxY = Math.max(minPoint.y, maxPoint.y);

      return {
        x: Math.round(Math.max(minX, Math.min(maxX, pos.x))),
        y: Math.round(Math.max(minY, Math.min(maxY, pos.y))),
      };
    },
    [screenToFlowPosition],
  );

  // Update nodes when room data changes, preserving reference equality, selection & drag position
  useEffect(() => {
    const updatedNodes = generateRoomNodes(room, currentUserId);
    setNodes((prevNodes) => {
      const prevMap = new Map(prevNodes.map((n) => [n.id, n]));
      return updatedNodes.map((n) => {
        const prev = prevMap.get(n.id);
        if (!prev) return n;

        // 1. Table Arena Node: only re-render if round, timer, or participants changed (ignore sticky note edits)
        if (n.type === NODE_TYPES.TABLE_ARENA) {
          const prevRoom = prev.data?.room as RoomProjection | undefined;
          const isIdentical =
            prevRoom &&
            prevRoom.currentRound === room.currentRound &&
            prevRoom.participants === room.participants;
          return isIdentical ? prev : n;
        }

        // 2. Participant Node: only re-render if participant state or roundStatus changed
        if (n.type === NODE_TYPES.PARTICIPANT) {
          const isIdentical =
            prev.data?.participant === n.data?.participant &&
            prev.data?.roundStatus === n.data?.roundStatus &&
            prev.position.x === n.position.x &&
            prev.position.y === n.position.y;
          return isIdentical ? prev : n;
        }

        // 3. Spectator Node: only re-render if participant state changed
        if (n.type === NODE_TYPES.SPECTATOR) {
          const isIdentical =
            prev.data?.participant === n.data?.participant &&
            prev.position.x === n.position.x &&
            prev.position.y === n.position.y;
          return isIdentical ? prev : n;
        }

        // 4. Sticky Note Node: handle active local drag, clamping, and reference equality
        if (n.type === NODE_TYPES.STICKY_NOTE) {
          const noteId = n.id.replace('sticky-note-', '');
          const selected = prev.selected ?? n.selected;

          // If local user is actively dragging this note, preserve the local drag position
          if (draggingNoteIdRef.current === noteId) {
            return {
              ...prev,
              selected,
            };
          }

          const clampedPos = clampToViewport(n.position);
          const isIdentical =
            prev.data?.note === n.data?.note &&
            prev.position.x === clampedPos.x &&
            prev.position.y === clampedPos.y &&
            prev.selected === selected;

          return isIdentical
            ? prev
            : {
                ...n,
                position: clampedPos,
                selected,
              };
        }

        return n;
      });
    });
  }, [room, currentUserId, setNodes, clampToViewport]);

  // Fingerprint participants to ensure arenaNodeIds only changes when membership changes
  const participantFingerprint = useMemo(
    () =>
      room.participants
        .map((p) => `${p.isSpectator ? 's' : 'e'}:${p.id}`)
        .sort()
        .join(','),
    [room.participants],
  );

  // Derive core arena nodes (table, participants, spectators) to guarantee center focus
  const arenaNodeIds = useMemo(
    () => [
      { id: 'table-arena-node' },
      ...room.participants.map((p) => ({
        id: p.isSpectator ? `spectator-${p.id}` : `participant-${p.id}`,
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [participantFingerprint],
  );

  const fitViewOptions = useMemo(
    () => ({
      padding: 0.45,
      nodes: arenaNodeIds,
    }),
    [arenaNodeIds],
  );

  // Lock and fit view ONLY on initial mount or when participants join/leave (never on note updates)
  useEffect(() => {
    const timer = setTimeout(() => {
      void fitView({
        nodes: arenaNodeIds,
        padding: 0.45,
        duration: 400,
      });
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitView, participantFingerprint]);

  // Intercept node position changes to enforce boundary clamping in real-time
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const clampedChanges = changes.map((change) => {
        if (change.type === 'position' && change.position && change.id.startsWith('sticky-note-')) {
          return {
            ...change,
            position: clampToViewport(change.position),
          };
        }
        return change;
      });
      onNodesChange(clampedChanges);
    },
    [onNodesChange, clampToViewport],
  );

  // Real-time live dragging motion for sticky notes (with boundary clamping)
  const handleNodeDrag: OnNodeDrag = useCallback(
    (_, node) => {
      if (node.type === NODE_TYPES.STICKY_NOTE) {
        const noteId = node.id.replace('sticky-note-', '');
        draggingNoteIdRef.current = noteId;
        const clampedPos = clampToViewport(node.position);
        moveStickyNote(noteId, clampedPos, false);
      }
    },
    [moveStickyNote, clampToViewport],
  );

  // Final position synchronization upon drag stop (with boundary clamping)
  const handleNodeDragStop: OnNodeDrag = useCallback(
    (_, node) => {
      if (node.type === NODE_TYPES.STICKY_NOTE) {
        const noteId = node.id.replace('sticky-note-', '');
        draggingNoteIdRef.current = null;
        const clampedPos = clampToViewport(node.position);
        moveStickyNote(noteId, clampedPos, true);
      }
    },
    [moveStickyNote, clampToViewport],
  );

  // Handle Drag & Drop from Sticky Note Stack into Canvas
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const color = e.dataTransfer.getData('application/pointify-sticky-note') as StickyNoteColor;
    if (color) {
      // Convert screen client coordinates to Flow world coordinates and clamp to safe viewport
      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const rawPos = {
        x: Math.round(flowPos.x - 85),
        y: Math.round(flowPos.y - 85),
      };
      const clampedPos = clampToViewport(rawPos);
      createStickyNote({
        color,
        position: clampedPos,
        text: '',
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="w-full h-full relative overflow-hidden bg-background pb-32"
    >
      {/* Subtle dual-layer ambient focal glow behind the table */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08)_0%,hsl(var(--primary)/0.02)_40%,transparent_70%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,hsl(var(--background))_100%)] opacity-60" />

      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        fitView
        fitViewOptions={fitViewOptions}
        minZoom={0.5}
        maxZoom={1.5}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        autoPanOnNodeDrag={false}
        autoPanOnConnect={false}
        preventScrolling={true}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        proOptions={{ hideAttribution: true }}
        className="touch-none select-none cursor-default"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.4} className="opacity-45" />
      </ReactFlow>

      {/* Miro-style Sticky Note Stack at bottom-left */}
      <StickyNoteStack />
    </div>
  );
}

interface RoomCanvasShellProps {
  room: RoomProjection;
  currentUserId?: string;
  stickyNoteActions: StickyNotesContextValue;
}

export function RoomCanvasShell({ room, currentUserId, stickyNoteActions }: RoomCanvasShellProps) {
  return (
    <StickyNotesContext.Provider value={stickyNoteActions}>
      <ReactFlowProvider>
        <RoomCanvasContent room={room} currentUserId={currentUserId} />
      </ReactFlowProvider>
    </StickyNotesContext.Provider>
  );
}
