import { useState, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import {
  Settings,
  User,
  Crown,
  Sun,
  Moon,
  Laptop,
  UserCheck,
  Eye,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAppStore, type SupportedLanguage } from '@/store/useAppStore';
import { DECK_CONFIGS } from '../../constants/deck-configs';
import type { DeckType, RoomProjection } from '../../types/room.types';

function CountryFlag({ countryCode, alt }: { countryCode: string; alt: string }) {
  return (
    <img
      src={`https://flagcdn.com/${countryCode}.svg`}
      alt={alt}
      width={18}
      height={13}
      loading="lazy"
      className="size-4 aspect-4/3 rounded-[2px] object-cover shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.12)] border border-black/10 dark:border-white/15"
    />
  );
}

export interface RoomSettingsDialogHandle {
  open: (tab?: 'personal' | 'room') => void;
  close: () => void;
}

interface RoomSettingsDialogProps {
  ref?: React.Ref<RoomSettingsDialogHandle>;
  room: RoomProjection;
  isFacilitator: boolean;
  currentUserId?: string;
  onSwitchRole?: (isSpectator: boolean) => void;
  isSwitchingRole?: boolean;
  onUpdateRoomConfig?: (config: { name?: string; deckType?: DeckType }) => void;
}

export function RoomSettingsDialog({
  ref,
  room,
  isFacilitator,
  currentUserId,
  onSwitchRole,
  isSwitchingRole = false,
  onUpdateRoomConfig,
}: RoomSettingsDialogProps) {
  const { t } = useTranslation('room');
  const { language, setLanguage } = useAppStore();
  const { theme, setTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'room'>('personal');

  // Room config draft state
  const [roomName, setRoomName] = useState(room.name);
  const [selectedDeck, setSelectedDeck] = useState<DeckType>(room.deckType);
  const [isSavingRoom, setIsSavingRoom] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync draft state when room data updates or modal opens
  useEffect(() => {
    setRoomName(room.name);
    setSelectedDeck(room.deckType);
  }, [room.name, room.deckType, isOpen]);

  useImperativeHandle(ref, () => ({
    open: (tab = 'personal') => {
      setActiveTab(tab === 'room' && !isFacilitator ? 'personal' : tab);
      setRoomName(room.name);
      setSelectedDeck(room.deckType);
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
    },
  }));

  const currentUserParticipant = room.participants.find((p) => p.id === currentUserId);
  const isCurrentSpectator = currentUserParticipant?.isSpectator ?? false;

  const hasAnyActiveVotes =
    room.currentRound.status === 'voting' &&
    room.participants.some((p) => p.hasEstimated && p.estimatedValue !== null);

  const isDeckChanged = selectedDeck !== room.deckType;
  const isNameChanged = roomName.trim() !== room.name;
  const hasRoomChanges = isNameChanged || isDeckChanged;

  const handleSaveRoomConfig = () => {
    if (!roomName.trim()) {
      toast.error(t('room.settingsDialog.roomNamePlaceholder'));
      return;
    }

    // If deck changed during active voting round with existing votes, ask for confirmation
    if (isDeckChanged && hasAnyActiveVotes) {
      setShowResetConfirm(true);
      return;
    }

    executeSaveRoomConfig();
  };

  const executeSaveRoomConfig = () => {
    setIsSavingRoom(true);
    onUpdateRoomConfig?.({
      name: roomName.trim(),
      deckType: selectedDeck,
    });

    toast.success(t('room.settingsDialog.saveSuccess'));
    setIsSavingRoom(false);
    setShowResetConfirm(false);
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 rounded-lg card-container-frame shadow-lg">
          <DialogHeader className="px-6 py-5 border-b border-border/60 bg-background">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-9 rounded-md bg-muted/60 text-foreground shrink-0 border border-border/60 shadow-xs">
                <Settings className="size-4.5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                  {t('room.settingsDialog.title')}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-normal mt-0.5">
                  {t('room.settingsDialog.description')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'personal' | 'room')}
            className="w-full flex flex-col"
          >
            <div className="px-6 pt-3 pb-2 border-b border-border/40 bg-background">
              <TabsList
                className={cn(
                  'grid w-full p-1 rounded-md bg-muted/60 h-9',
                  isFacilitator ? 'grid-cols-2' : 'grid-cols-1',
                )}
              >
                <TabsTrigger
                  value="personal"
                  className="rounded-sm text-sm font-medium gap-2 h-7 transition-all cursor-pointer"
                >
                  <User className="size-4" />
                  <span>{t('room.settingsDialog.tabPersonal')}</span>
                </TabsTrigger>
                {isFacilitator && (
                  <TabsTrigger
                    value="room"
                    className="rounded-sm text-sm font-medium gap-2 h-7 transition-all cursor-pointer"
                  >
                    <Crown className="size-4 text-amber-500" />
                    <span>{t('room.settingsDialog.tabRoom')}</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-160px)]">
              {/* TAB 1: PERSONAL PREFERENCES */}
              <TabsContent value="personal" className="mt-0 space-y-4">
                {/* 1. Language Row */}
                <div className="flex items-center justify-between gap-4 py-1">
                  <span className="text-sm font-medium text-foreground">
                    {t('room.settingsDialog.languageTitle')}
                  </span>

                  <Select
                    value={language}
                    onValueChange={(val) => setLanguage(val as SupportedLanguage)}
                  >
                    <SelectTrigger className="w-48 h-[38px] rounded-md bg-background border-border/80 text-sm font-medium cursor-pointer">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <CountryFlag countryCode={language === 'vi' ? 'vn' : 'gb'} alt="" />
                          <span>{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align="end" className="w-48 rounded-md bg-popover border-border">
                      <SelectItem value="vi" className="rounded-sm cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CountryFlag countryCode="vn" alt="Tiếng Việt" />
                          <span>Tiếng Việt</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="en" className="rounded-sm cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CountryFlag countryCode="gb" alt="English" />
                          <span>English</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Theme Row */}
                <div className="flex items-center justify-between gap-4 py-1">
                  <span className="text-sm font-medium text-foreground">
                    {t('room.settingsDialog.themeTitle')}
                  </span>

                  <Select value={theme || 'system'} onValueChange={(val) => setTheme(val)}>
                    <SelectTrigger className="w-48 h-[38px] rounded-md bg-background border-border/80 text-sm font-medium cursor-pointer">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {theme === 'light' && <Sun className="size-4 text-muted-foreground" />}
                          {theme === 'dark' && <Moon className="size-4 text-muted-foreground" />}
                          {(!theme || theme === 'system') && (
                            <Laptop className="size-4 text-muted-foreground" />
                          )}
                          <span>
                            {theme === 'light' && t('room.settingsDialog.themeLight')}
                            {theme === 'dark' && t('room.settingsDialog.themeDark')}
                            {(!theme || theme === 'system') && t('room.settingsDialog.themeSystem')}
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align="end" className="w-48 rounded-md bg-popover border-border">
                      <SelectItem value="light" className="rounded-sm cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Sun className="size-4 text-muted-foreground" />
                          <span>{t('room.settingsDialog.themeLight')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark" className="rounded-sm cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Moon className="size-4 text-muted-foreground" />
                          <span>{t('room.settingsDialog.themeDark')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system" className="rounded-sm cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Laptop className="size-4 text-muted-foreground" />
                          <span>{t('room.settingsDialog.themeSystem')}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-px w-full bg-border/50 my-1" />

                {/* 3. Role Selection (Clean Industrial Radio Cards with High Contrast) */}
                <div className="space-y-3 pt-1">
                  <span className="text-sm font-medium text-foreground block">
                    {t('room.settingsDialog.roleTitle')}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Option 1: Estimator */}
                    <button
                      type="button"
                      disabled={isSwitchingRole}
                      onClick={() => onSwitchRole?.(false)}
                      className={cn(
                        'relative flex items-start gap-3.5 p-4 rounded-md border text-left transition-all duration-150 cursor-pointer disabled:opacity-60',
                        !isCurrentSpectator
                          ? 'border-primary ring-1 ring-primary/25 bg-primary/[0.03] shadow-xs'
                          : 'border-border bg-card hover:border-slate-400 dark:hover:border-slate-600 hover:bg-muted/30',
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center size-9 rounded-md shrink-0 mt-0.5 border transition-colors',
                          !isCurrentSpectator
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-muted/80 border-border/80 text-foreground/70',
                        )}
                      >
                        {isSwitchingRole && isCurrentSpectator ? (
                          <Loader2 className="size-4.5 animate-spin" />
                        ) : (
                          <UserCheck className="size-4.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-5">
                        <div className="font-semibold text-sm text-foreground">
                          {t('room.settingsDialog.roleEstimator')}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                          {t('room.settingsDialog.roleEstimatorDesc')}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4">
                        {!isCurrentSpectator ? (
                          <div className="size-4.5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
                            <Check className="size-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="size-4.5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                        )}
                      </div>
                    </button>

                    {/* Option 2: Spectator */}
                    <button
                      type="button"
                      disabled={isSwitchingRole}
                      onClick={() => onSwitchRole?.(true)}
                      className={cn(
                        'relative flex items-start gap-3.5 p-4 rounded-md border text-left transition-all duration-150 cursor-pointer disabled:opacity-60',
                        isCurrentSpectator
                          ? 'border-primary ring-1 ring-primary/25 bg-primary/[0.03] shadow-xs'
                          : 'border-border bg-card hover:border-slate-400 dark:hover:border-slate-600 hover:bg-muted/30',
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center size-9 rounded-md shrink-0 mt-0.5 border transition-colors',
                          isCurrentSpectator
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-muted/80 border-border/80 text-foreground/70',
                        )}
                      >
                        {isSwitchingRole && !isCurrentSpectator ? (
                          <Loader2 className="size-4.5 animate-spin" />
                        ) : (
                          <Eye className="size-4.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-5">
                        <div className="font-semibold text-sm text-foreground">
                          {t('room.settingsDialog.roleSpectator')}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                          {t('room.settingsDialog.roleSpectatorDesc')}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4">
                        {isCurrentSpectator ? (
                          <div className="size-4.5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
                            <Check className="size-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="size-4.5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: ROOM CONFIGURATION (Facilitator only) */}
              {isFacilitator && (
                <TabsContent value="room" className="mt-0 space-y-6">
                  {/* Room Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="room-name-input"
                      className="text-sm font-medium text-foreground flex items-center justify-between"
                    >
                      <span>{t('room.settingsDialog.roomNameLabel')}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {roomName.length}/100
                      </span>
                    </Label>
                    <Input
                      id="room-name-input"
                      value={roomName}
                      maxLength={100}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder={t('room.settingsDialog.roomNamePlaceholder')}
                      className="h-[38px] text-sm rounded-md bg-background border-border/80"
                    />
                  </div>

                  {/* Estimation Deck Selection */}
                  <div className="space-y-2.5">
                    <span className="text-sm font-medium text-foreground block">
                      {t('room.settingsDialog.deckLabel')}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DECK_CONFIGS.map((deck) => {
                        const isSelected = selectedDeck === deck.id;
                        return (
                          <button
                            key={deck.id}
                            type="button"
                            onClick={() => setSelectedDeck(deck.id)}
                            className={cn(
                              'relative flex flex-col p-3.5 rounded-md border text-left transition-all duration-150 cursor-pointer',
                              isSelected
                                ? 'border-primary bg-primary/[0.04] text-foreground ring-1 ring-primary/20 shadow-xs'
                                : 'border-border/70 hover:bg-muted/40 text-foreground',
                            )}
                          >
                            <div className="flex items-center justify-between mb-1 pr-6">
                              <span className="font-medium text-sm text-foreground">
                                {t(`decks.${deck.translationKey}.name`)}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground leading-normal mb-2 line-clamp-1">
                              {t(`decks.${deck.translationKey}.description`)}
                            </p>

                            <div className="flex flex-wrap gap-1 items-center">
                              {deck.cards.slice(0, 7).map((cardVal, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs font-mono font-medium px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground border border-border/60"
                                >
                                  {cardVal}
                                </span>
                              ))}
                              {deck.cards.length > 7 && (
                                <span className="text-xs font-mono text-muted-foreground">
                                  +{deck.cards.length - 7}
                                </span>
                              )}
                            </div>

                            <div className="absolute top-3.5 right-3.5">
                              {isSelected ? (
                                <div className="size-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
                                  <Check className="size-2.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="size-4 rounded-full border border-border/80" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Warning banner if changing deck during active round */}
                  {isDeckChanged && hasAnyActiveVotes && (
                    <div className="p-3 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                      <AlertTriangle className="size-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <span className="font-semibold block mb-0.5">
                          {t('room.settingsDialog.resetConfirmTitle')}
                        </span>
                        {t('room.settingsDialog.resetConfirmDesc')}
                      </div>
                    </div>
                  )}

                  {/* Save button */}
                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={handleSaveRoomConfig}
                      disabled={isSavingRoom || !hasRoomChanges}
                      className="h-[38px] px-5 text-sm font-medium rounded-md cursor-pointer shadow-xs gap-2 bg-primary hover:bg-brand-hover text-primary-foreground transition-colors duration-150"
                    >
                      {isSavingRoom ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>{t('room.settingsDialog.saving')}</span>
                        </>
                      ) : (
                        <span>{t('room.settingsDialog.saveChanges')}</span>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog when Changing Deck during active voting with submitted cards */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="sm:max-w-md rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5 text-destructive" />
              <span>{t('room.settingsDialog.resetConfirmTitle')}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t('room.settingsDialog.resetConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="h-[38px] rounded-md text-sm font-medium cursor-pointer">
              {t('room.settingsDialog.resetConfirmCancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeSaveRoomConfig}
              className="h-[38px] rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {t('room.settingsDialog.resetConfirmAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
