import { memo } from 'react';
import { Eye } from 'lucide-react';
import type { ParticipantProjection } from '../../types/room.types';

interface SpectatorNodeProps {
  data: {
    participant?: ParticipantProjection;
    isCurrentUser?: boolean;
  };
}

export const SpectatorNode = memo(function SpectatorNode({ data }: SpectatorNodeProps) {
  const { participant, isCurrentUser } = data;

  if (!participant) return null;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed backdrop-blur-md shadow-xs select-none transition-all ${
        isCurrentUser
          ? 'bg-primary/10 border-primary/60 text-foreground'
          : 'bg-muted/40 border-border/80 text-muted-foreground'
      }`}
    >
      <Eye className="size-3.5 text-muted-foreground shrink-0" />
      <div className="size-5 rounded-full bg-muted text-foreground font-bold text-[10px] flex items-center justify-center shrink-0">
        {participant.displayName.charAt(0).toUpperCase()}
      </div>
      <span className="text-xs font-medium max-w-[100px] truncate">{participant.displayName}</span>
    </div>
  );
});
