import { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { TableArenaNode } from './table-arena-node';
import { ParticipantNode } from './participant-node';
import { SpectatorNode } from './spectator-node';
import { generateRoomNodes, NODE_TYPES } from '../../utils/canvas-layout-helper';
import type { RoomProjection } from '../../types/room.types';

const nodeTypes = {
  [NODE_TYPES.TABLE_ARENA]: TableArenaNode,
  [NODE_TYPES.PARTICIPANT]: ParticipantNode,
  [NODE_TYPES.SPECTATOR]: SpectatorNode,
};

interface RoomCanvasContentProps {
  room: RoomProjection;
  currentUserId?: string;
}

function RoomCanvasContent({ room, currentUserId }: RoomCanvasContentProps) {
  const { fitView } = useReactFlow();

  const initialNodes = useMemo(() => generateRoomNodes(room, currentUserId), [room, currentUserId]);

  const [nodes, setNodes] = useNodesState(initialNodes);

  // Update nodes when room data changes
  useEffect(() => {
    const updatedNodes = generateRoomNodes(room, currentUserId);
    setNodes(updatedNodes);
  }, [room, currentUserId, setNodes]);

  // Lock and fit view on mount or participant count changes
  useEffect(() => {
    const timer = setTimeout(() => {
      void fitView({ padding: 0.45, duration: 400 });
    }, 50);
    return () => clearTimeout(timer);
  }, [fitView, room.participants.length]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-background pb-32">
      {/* Subtle dual-layer ambient focal glow behind the table */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08)_0%,hsl(var(--primary)/0.02)_40%,transparent_70%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,hsl(var(--background))_100%)] opacity-60" />

      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.45 }}
        minZoom={0.5}
        maxZoom={1.5}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={true}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        className="touch-none select-none cursor-default"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.4} className="opacity-45" />
      </ReactFlow>
    </div>
  );
}

interface RoomCanvasShellProps {
  room: RoomProjection;
  currentUserId?: string;
}

export function RoomCanvasShell({ room, currentUserId }: RoomCanvasShellProps) {
  return (
    <ReactFlowProvider>
      <RoomCanvasContent room={room} currentUserId={currentUserId} />
    </ReactFlowProvider>
  );
}
