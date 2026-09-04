import { useTranslation } from 'react-i18next';
import { Eye, RotateCcw, Play, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CurrentRoundProjection } from '../../types/room.types';

interface FacilitatorActionBarProps {
  currentRound: CurrentRoundProjection;
  onReveal: () => void;
  onNewRound: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function FacilitatorActionBar({
  currentRound,
  onReveal,
  onNewRound,
  onReset,
  isLoading = false,
}: FacilitatorActionBarProps) {
  const { t } = useTranslation();
  const isRevealed = currentRound.status === 'revealed' || currentRound.status === 'completed';

  return (
    <div className="absolute bottom-20 sm:bottom-24 inset-x-0 z-30 pointer-events-none flex justify-center px-4">
      <div className="pointer-events-auto inline-flex items-center gap-1.5 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-full px-1.5 py-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
        {!isRevealed ? (
          <Button
            onClick={onReveal}
            disabled={isLoading}
            size="sm"
            className="rounded-full gap-1.5 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 cursor-pointer h-8 px-4"
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Eye className="size-3.5" />
            )}
            <span>{t('room.revealCards', 'Lật bài ngay')}</span>
          </Button>
        ) : (
          <Button
            onClick={onNewRound}
            disabled={isLoading}
            size="sm"
            className="rounded-full gap-1.5 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 cursor-pointer h-8 px-4"
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            <span>{t('room.nextRound', 'Vòng tiếp theo')}</span>
          </Button>
        )}

        <Button
          onClick={onReset}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="rounded-full gap-1 text-xs font-medium cursor-pointer h-8 px-3 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" />
          <span>{t('room.resetRound', 'Bỏ phiếu lại')}</span>
        </Button>

        <div className="h-4 w-px bg-border/40 mx-0.5" />

        <div className="flex items-center gap-1 px-2 text-[10px] font-medium text-muted-foreground/70">
          <Sparkles className="size-2.5 text-amber-500" />
          <span>Điều phối</span>
        </div>
      </div>
    </div>
  );
}
