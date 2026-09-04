import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Eye, Sparkles, Check } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import type { StoredParticipant } from '../../utils/participant-session';

const AVATAR_PRESETS = ['🐶', '🐱', '🦊', '🐼', '🐨', '🦁', '🐯', '🦄', '🚀', '⚡', '🔥', '🎯'];

interface JoinRoomDialogProps {
  open: boolean;
  roomName: string;
  onJoin: (participant: StoredParticipant) => void;
}

export function JoinRoomDialog({ open, roomName, onJoin }: JoinRoomDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedEmoji, setSelectedEmoji] = useState('🦊');
  const [isSpectator, setIsSpectator] = useState(false);
  const [error, setError] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = displayName.trim();

    if (!finalName) {
      setError(t('room.join.nameRequired', 'Vui lòng nhập tên của bạn'));
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

    onJoin(participant);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-6 select-none"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1 border border-primary/20 shadow-inner">
            <Sparkles className="size-6 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {t('room.join.title', 'Tham gia phòng')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground line-clamp-1">
            {t('room.join.subtitle', { roomName, defaultValue: `Phòng: ${roomName}` })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleJoinSubmit} className="space-y-5 pt-2">
          {/* 1. Display Name */}
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-xs font-semibold text-foreground/80">
              {t('room.join.displayName', 'Tên hiển thị của bạn')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (error) setError('');
              }}
              placeholder={t('room.join.namePlaceholder', 'Ví dụ: Alex Nguyễn...')}
              autoFocus
              className="h-10 text-sm focus-visible:ring-primary/40"
              maxLength={40}
            />
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          </div>

          {/* 2. Avatar Selection (If Guest) */}
          {!user?.photoURL && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground/80">
                {t('room.join.pickAvatar', 'Chọn biểu tượng đại diện')}
              </Label>
              <div className="grid grid-cols-6 gap-2 p-2 rounded-xl bg-muted/30 border border-border/40">
                {AVATAR_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`size-10 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer ${
                      selectedEmoji === emoji
                        ? 'bg-primary/20 border-2 border-primary scale-105 shadow-sm'
                        : 'hover:bg-muted/60 border border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Auth Indicator */}
          {user && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <Avatar className="size-9 border border-border">
                {user.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {user.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user.displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* 3. Role Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground/80">
              {t('room.join.roleLabel', 'Vai trò tham gia')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsSpectator(false)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !isSpectator
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <User className="size-4" />
                  {!isSpectator && <Check className="size-3.5" />}
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {t('room.role.estimator', 'Ước lượng')}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {t('room.role.estimatorDesc', 'Tham gia chọn điểm lá bài')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsSpectator(true)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSpectator
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Eye className="size-4" />
                  {isSpectator && <Check className="size-3.5" />}
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {t('room.role.spectator', 'Quan sát')}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {t('room.role.spectatorDesc', 'Chỉ theo dõi tiến trình')}
                </span>
              </button>
            </div>
          </div>

          <DialogFooter className="pt-2 sm:justify-center">
            <Button
              type="submit"
              size="lg"
              className="w-full h-11 text-sm font-semibold rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01]"
            >
              {t('room.join.submitButton', 'Bước vào phòng')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
