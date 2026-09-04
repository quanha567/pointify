import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Copy, Link2, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { RoomProjection } from '../../types/room.types';

interface InviteParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: RoomProjection;
}

export function InviteParticipantDialog({
  open,
  onOpenChange,
  room,
}: InviteParticipantDialogProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const roomUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/rooms/${room.id}`;
  }, [room.id]);

  const inviteMessage = useMemo(() => {
    return t('room.inviteDialog.messageTemplate', {
      roomName: room.name,
      roomCode: room.id,
      roomUrl,
    });
  }, [room.name, room.id, roomUrl, t]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      setCopied(true);
      toast.success(t('room.inviteDialog.linkCopied', 'Đã sao chép link mời!'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('room.failedCopy', 'Không thể sao chép'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden">
        <DialogHeader className="pb-1 text-left">
          <DialogTitle className="flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-tight">
            <div className="flex items-center justify-center size-8 rounded-xl bg-primary/10 text-primary">
              <Share2 className="size-4" />
            </div>
            <span>{t('room.inviteDialog.title', 'Mời vào phòng')}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-0.5">
            {t(
              'room.inviteDialog.description',
              'Quét mã QR hoặc gửi link để mời mọi người vào phòng.',
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Borderless, clean QR presentation */}
          <div className="flex flex-col items-center justify-center py-2 gap-3">
            {/* Pure white QR canvas without unnecessary borders */}
            <div className="relative inline-flex items-center justify-center p-3">
              <QRCodeSVG value={roomUrl} size={184} level="H" fgColor="#0f172a" bgColor="#ffffff" />
            </div>
          </div>

          {/* Room Link & Action */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Link2 className="size-4 text-primary" />
              <span>{t('room.inviteDialog.roomUrl', 'Link phòng')}</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={roomUrl}
                className="h-10 text-xs sm:text-sm bg-muted/40 font-mono select-all rounded-xl border-border/70"
              />
              <Button
                onClick={handleCopyLink}
                className="h-10 px-4 shrink-0 gap-2 text-sm font-semibold rounded-xl cursor-pointer shadow-xs transition-transform active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    <span>{t('room.inviteDialog.copied', 'Đã chép')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    <span>{t('room.inviteDialog.copyUrl', 'Sao chép link')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
