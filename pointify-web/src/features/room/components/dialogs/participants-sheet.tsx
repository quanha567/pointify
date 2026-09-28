import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { TFunction } from 'i18next';
import { Eye, Search, Users, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { memo, useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParticipantProjection, RoomProjection } from '../../types/room.types';
import {
  getMascotForParticipant,
  getMascotFromPhotoUrl,
  MASCOT_LIST,
} from '../canvas/mascots/mascot-registry';

const AVATAR_PALETTES = [
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
  'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
  'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25',
  'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
  'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
  'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/25',
  'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
];

function getAvatarPalette(identifier: string): string {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface ParticipantRowProps {
  participant: ParticipantProjection;
  isSelf: boolean;
  t: TFunction<'room'>;
  isVietnamese: boolean;
}

const ParticipantRow = memo(function ParticipantRow({
  participant: p,
  isSelf,
  t,
  isVietnamese,
}: ParticipantRowProps) {
  const avatarPalette = useMemo(
    () => getAvatarPalette(p.id || p.displayName),
    [p.id, p.displayName],
  );
  const initials = useMemo(() => getInitials(p.displayName), [p.displayName]);

  const customMascot = useMemo(() => getMascotFromPhotoUrl(p.photoURL), [p.photoURL]);
  const mascotId = useMemo(
    () => (customMascot ? customMascot.id : getMascotForParticipant(p.id)),
    [customMascot, p.id],
  );
  const mascotInfo = useMemo(
    () => customMascot ?? MASCOT_LIST.find((m) => m.id === mascotId) ?? MASCOT_LIST[0],
    [customMascot, mascotId],
  );
  const mascotName = isVietnamese ? mascotInfo.nameVi : mascotInfo.nameEn;

  const avatarSrc = useMemo(() => {
    return p.photoURL &&
      !customMascot &&
      (p.photoURL.startsWith('http') || p.photoURL.startsWith('data:'))
      ? p.photoURL
      : mascotInfo.imageSrc;
  }, [p.photoURL, customMascot, mascotInfo.imageSrc]);

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className={cn(
        'group flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-colors duration-150',
        isSelf
          ? 'border-primary/40 bg-primary/[0.04] shadow-xs'
          : p.isOnline
            ? 'border-border/60 bg-card hover:bg-muted/40 hover:border-border/80'
            : 'border-border/30 bg-muted/15 opacity-65',
      )}
    >
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
        <Avatar
          size="default"
          className={cn(
            'size-10 shrink-0 ring-1 ring-border/40 bg-muted/40 transition-transform duration-150 group-hover:scale-105',
            avatarPalette,
          )}
          title={`${p.displayName} (${mascotName})`}
        >
          <AvatarImage
            src={avatarSrc}
            alt={mascotName}
            loading="lazy"
            decoding="async"
            className={cn(
              'object-contain p-0.5 pointer-events-none',
              !p.isOnline && 'grayscale opacity-60',
            )}
          />
          <AvatarFallback className={cn('text-xs font-semibold border', avatarPalette)}>
            {initials}
          </AvatarFallback>
          <AvatarBadge
            className={cn(
              'size-2.5 ring-2 ring-background',
              p.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40',
            )}
          />
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-sm font-semibold text-foreground truncate max-w-[130px] sm:max-w-[160px]"
              title={p.displayName}
            >
              {p.displayName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
            {p.isSpectator ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Eye className="size-3 shrink-0" />
                {t('roles.spectator')}
              </span>
            ) : (
              <span>{t('roles.estimator')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Role / Status Badge */}
      <div className="shrink-0 flex items-center gap-1.5">
        {p.isFacilitator ? (
          <Badge
            variant="outline"
            className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25 gap-1 py-0.5 px-2"
          >
            <span>{t('roles.facilitator')}</span>
          </Badge>
        ) : p.isSpectator ? (
          <Badge
            variant="outline"
            className="text-xs font-normal text-muted-foreground bg-muted/40 border-border/60 py-0.5 px-2 gap-1"
          >
            <Eye className="size-3" />
            <span>{t('room.spectatorBadge')}</span>
          </Badge>
        ) : !p.isOnline ? (
          <Badge
            variant="outline"
            className="text-xs font-normal text-muted-foreground/70 border-dashed border-border/50 py-0.5 px-2"
          >
            {t('room.offline')}
          </Badge>
        ) : null}
      </div>
    </motion.div>
  );
});

interface ParticipantsSheetProps {
  room: RoomProjection;
  currentUserId?: string;
  trigger?: React.ReactNode;
}

export function ParticipantsSheet({ room, currentUserId, trigger }: ParticipantsSheetProps) {
  const { t, i18n } = useTranslation('room');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  // Non-blocking deferred search query for smooth input performance
  const deferredSearch = useDeferredValue(searchQuery);

  const onlineCount = room.participants.filter((p) => p.isOnline).length;
  const isVietnamese = i18n.language.startsWith('vi');

  const sortedParticipants = useMemo(() => {
    return [...room.participants].sort((a, b) => {
      // 1. Current user first
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;

      // 2. Facilitator second
      if (a.isFacilitator && !b.isFacilitator) return -1;
      if (!a.isFacilitator && b.isFacilitator) return 1;

      // 3. Online before offline
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;

      // 4. Alphabetical by display name
      return a.displayName.localeCompare(b.displayName);
    });
  }, [room.participants, currentUserId]);

  const filteredParticipants = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return sortedParticipants;
    return sortedParticipants.filter((p) => p.displayName.toLowerCase().includes(q));
  }, [sortedParticipants, deferredSearch]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="sm"
            className="rounded-md gap-1.5 sm:gap-2 text-sm font-medium shadow-2xs cursor-pointer h-[34px] px-2.5 sm:px-3 border-border hover:bg-muted text-foreground transition-colors"
          >
            <div className="relative flex items-center">
              <Users className="size-4 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
            </div>
            <span className="hidden sm:inline">{t('room.members')}</span>
            <span className="font-mono font-semibold text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {onlineCount}/{room.participants.length}
            </span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[340px] sm:w-[400px] p-0 flex flex-col gap-0 border-l border-border"
      >
        {/* Header */}
        <SheetHeader className="p-5 pb-3.5 border-b border-border shrink-0">
          <SheetTitle className="text-base font-semibold flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2 min-w-0">
              <Users className="size-4 text-primary shrink-0" />
              <span className="whitespace-nowrap">{t('room.participants')}</span>
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-sm tabular-nums shrink-0">
              {onlineCount}/{room.participants.length}
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">{t('room.participants')}</SheetDescription>
        </SheetHeader>

        {/* Filter Input (shown when more than 5 participants) */}
        {room.participants.length > 5 && (
          <div className="px-5 pt-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('room.searchParticipants')}
                className="pl-8.5 pr-8 h-8 text-xs rounded-md bg-muted/40 border-border focus-visible:bg-background transition-colors"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-6 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Participant List with GPU-accelerated scrolling and smooth motion animations */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5 overscroll-contain transform-gpu will-change-scroll">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredParticipants.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                className="text-center py-8 text-xs text-muted-foreground"
              >
                {t('room.noParticipantsFound')}
              </motion.div>
            ) : (
              filteredParticipants.map((p) => (
                <ParticipantRow
                  key={p.id}
                  participant={p}
                  isSelf={p.id === currentUserId}
                  t={t}
                  isVietnamese={isVietnamese}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
