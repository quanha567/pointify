import { useState, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Eye, Sparkles, Check, LogIn, Hash } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import type { StoredParticipant } from '../../utils/participant-session';
import type { ParticipantRole } from '../../types/room.types';

const AVATAR_PRESETS = ['🐶', '🐱', '🦊', '🐼', '🐨', '🦁', '🐯', '🦄', '🚀', '⚡', '🔥', '🎯'];

export interface JoinRoomDialogOptions {
  roomId?: string;
  roomName?: string;
}

export interface JoinRoomDialogHandle {
  open: (options?: JoinRoomDialogOptions) => void;
  close: () => void;
}

export interface JoinRoomDialogProps {
  ref?: React.Ref<JoinRoomDialogHandle>;
  defaultOpen?: boolean;
  open?: boolean;
  roomName?: string;
  roomId?: string;
  onJoin?: (participant: StoredParticipant) => void;
  onClose?: () => void;
}

export function JoinRoomDialog({
  ref,
  defaultOpen,
  open: controlledOpen,
  roomName: controlledRoomName,
  roomId: controlledRoomId,
  onJoin,
  onClose,
}: JoinRoomDialogProps) {
  const { t } = useTranslation(['room', 'common']);
  const navigate = useNavigate();
  const { user, isGuest, guestName } = useAuthStore();
  const { addRecentRoom } = useAppStore();

  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const [internalRoomId, setInternalRoomId] = useState('');
  const [internalRoomName, setInternalRoomName] = useState('');

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const currentUserName = user?.displayName || (isGuest ? guestName : '') || '';
  const [displayName, setDisplayName] = useState(currentUserName);
  const [selectedEmoji, setSelectedEmoji] = useState('🦊');
  const [isSpectator, setIsSpectator] = useState(false);
  const [roomCode, setRoomCode] = useState(controlledRoomId || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUserName && !displayName) {
      setDisplayName(currentUserName);
    }
  }, [currentUserName, displayName]);

  // Sync controlled roomId if provided
  useEffect(() => {
    if (controlledRoomId) {
      setRoomCode(controlledRoomId);
    }
  }, [controlledRoomId]);

  useImperativeHandle(ref, () => ({
    open: (options?: JoinRoomDialogOptions) => {
      if (options?.roomId) {
        setRoomCode(options.roomId);
        setInternalRoomId(options.roomId);
      } else {
        setRoomCode('');
        setInternalRoomId('');
      }
      if (options?.roomName) {
        setInternalRoomName(options.roomName);
      }
      setDisplayName(currentUserName);
      setError('');
      setInternalOpen(true);
    },
    close: () => {
      setInternalOpen(false);
      onClose?.();
    },
  }));

  const activeRoomId = controlledRoomId || internalRoomId;
  const activeRoomName = controlledRoomName || internalRoomName;
  const isDirectRoomJoin = Boolean(activeRoomId) || Boolean(controlledOpen);

  const handleClose = () => {
    // Prevent closing if direct room join (user must join to participate)
    if (isDirectRoomJoin && onJoin) return;
    setInternalOpen(false);
    onClose?.();
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = displayName.trim();

    if (!finalName) {
      setError(t('room.join.nameRequired', 'Vui lòng nhập tên của bạn'));
      return;
    }

    const targetRoomId = (activeRoomId || roomCode).trim().toUpperCase();
    if (!targetRoomId) {
      setError(t('room:joinRoom.errorCodeRequired', 'Vui lòng nhập mã phòng'));
      return;
    }

    const participantId =
      user?.uid || `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const participant: StoredParticipant = {
      id: participantId,
      displayName: finalName,
      photoURL: user?.photoURL || selectedEmoji,
      isGuest: !user,
      isSpectator,
    };

    // Save to recent rooms
    addRecentRoom({
      code: targetRoomId,
      name: activeRoomName || `Room ${targetRoomId}`,
      deckType: 'fibonacci',
      lastVisited: t('room:recentRooms.justNow', 'Vừa xong'),
      role: (isSpectator ? 'spectator' : 'estimator') as ParticipantRole,
    });

    if (onJoin) {
      // In-room join handler
      onJoin(participant);
    } else {
      // Dashboard join -> navigate into the room
      const roleLabel = isSpectator ? t('room:roles.spectator') : t('room:roles.estimator');
      toast.success(t('room:joinRoom.successToast', { code: targetRoomId, role: roleLabel }));
      setInternalOpen(false);
      void navigate({ to: '/rooms/$roomId', params: { roomId: targetRoomId } });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => !openState && handleClose()}>
      <DialogContent
        className="sm:max-w-md border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-6 select-none"
        onPointerDownOutside={(e) => {
          if (isDirectRoomJoin && onJoin) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isDirectRoomJoin && onJoin) e.preventDefault();
        }}
        showCloseButton={!isDirectRoomJoin || !onJoin}
      >
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1 border border-primary/20 shadow-inner">
            <Sparkles className="size-6 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {t('room.join.title', 'Tham gia phòng ước lượng')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground line-clamp-1">
            {activeRoomName
              ? t('room.join.subtitle', { roomName: activeRoomName })
              : t('room:joinRoom.modalDescription', 'Nhập mã phòng để cùng tham gia ước lượng')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleJoinSubmit} className="space-y-5 pt-2">
          {/* Room Code (Visible only if not in direct room view) */}
          {!isDirectRoomJoin && (
            <div className="space-y-1.5">
              <Label htmlFor="roomCode" className="text-xs font-semibold text-foreground/80">
                {t('room:joinRoom.roomCodeLabel', 'Mã phòng')}{' '}
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    if (error) setError('');
                  }}
                  placeholder="VD: SCRUM-123"
                  className="pl-9 h-10 text-sm font-mono uppercase focus-visible:ring-primary/40"
                  maxLength={20}
                />
              </div>
            </div>
          )}

          {/* Display Name */}
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-xs font-semibold text-foreground/80">
              {t('room.join.displayName', 'Tên hiển thị')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (error) setError('');
              }}
              placeholder={t('room.join.namePlaceholder', 'VD: John Doe')}
              autoFocus={!isDirectRoomJoin ? false : true}
              className="h-10 text-sm focus-visible:ring-primary/40"
              maxLength={40}
            />
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          </div>

          {/* Avatar Selection (If Guest) */}
          {!user && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground/80">
                {t('room.join.chooseAvatar', 'Chọn Avatar')}
              </Label>
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full border-2 border-primary/40 bg-muted/60 flex items-center justify-center text-2xl shadow-xs shrink-0">
                  {selectedEmoji}
                </div>
                <div className="flex-1 grid grid-cols-6 gap-1.5 p-1.5 rounded-lg border border-border/60 bg-muted/20">
                  {AVATAR_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`size-8 rounded-md flex items-center justify-center text-base hover:bg-muted transition-colors cursor-pointer relative ${
                        selectedEmoji === emoji ? 'bg-primary/20 ring-1 ring-primary' : ''
                      }`}
                    >
                      {emoji}
                      {selectedEmoji === emoji && (
                        <div className="absolute -top-1 -right-1 size-3 bg-primary rounded-full flex items-center justify-center">
                          <Check className="size-2 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Signed-in User Info */}
          {user && (
            <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-muted/30">
              <Avatar className="size-10 border border-border">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="text-xs font-bold">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Spectator Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/10">
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Eye className="size-3.5 text-muted-foreground" />
                <span>{t('room.join.spectatorMode', 'Chế độ quan sát')}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {t(
                  'room.join.spectatorHint',
                  'Chỉ theo dõi và thảo luận, không tham gia ước lượng story points',
                )}
              </p>
            </div>
            <Switch checked={isSpectator} onCheckedChange={setIsSpectator} />
          </div>

          <DialogFooter className="pt-2 flex flex-row items-center justify-end gap-2">
            {(!isDirectRoomJoin || !onJoin) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-10 text-xs sm:text-sm cursor-pointer"
              >
                {t('common:common.cancel', 'Hủy')}
              </Button>
            )}
            <Button
              type="submit"
              className="h-10 text-xs sm:text-sm font-semibold gap-2 shadow-md shadow-primary/20 cursor-pointer flex-1 sm:flex-initial"
            >
              <LogIn className="size-4" />
              <span>{t('room.join.submit', 'Vào phòng')}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
