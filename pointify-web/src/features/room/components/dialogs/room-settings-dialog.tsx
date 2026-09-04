import { useState, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import {
  Settings,
  User,
  Sliders,
  Crown,
  Languages,
  Sun,
  Moon,
  Laptop,
  UserCheck,
  Eye,
  Check,
  AlertTriangle,
  Loader2,
  Sparkles,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { DECK_CONFIGS } from '../../constants/deck-configs';
import type { DeckType, RoomProjection } from '../../types/room.types';

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
  const { t } = useTranslation();
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
      toast.error(t('room.settingsDialog.roomNamePlaceholder', 'Vui lòng nhập tên phòng'));
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

    toast.success(t('room.settingsDialog.saveSuccess', 'Đã cập nhật cấu hình phòng thành công!'));
    setIsSavingRoom(false);
    setShowResetConfirm(false);
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 rounded-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20 shadow-xs">
                <Settings className="size-4.5" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {t('room.settingsDialog.title', 'Cài đặt phòng')}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-normal mt-0.5">
                  {t(
                    'room.settingsDialog.description',
                    'Tùy chỉnh trải nghiệm cá nhân và cấu hình phòng ước lượng.',
                  )}
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
              <TabsList className="grid w-full grid-cols-2 p-1 rounded-xl bg-muted/60">
                <TabsTrigger
                  value="personal"
                  className="rounded-lg text-sm font-semibold gap-2 py-1.5 transition-all cursor-pointer"
                >
                  <User className="size-4" />
                  <span>{t('room.settingsDialog.tabPersonal', 'Cá nhân')}</span>
                </TabsTrigger>
                {isFacilitator && (
                  <TabsTrigger
                    value="room"
                    className="rounded-lg text-sm font-semibold gap-2 py-1.5 transition-all cursor-pointer"
                  >
                    <Crown className="size-4 text-amber-500" />
                    <span>{t('room.settingsDialog.tabRoom', 'Phòng')}</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-160px)]">
              {/* TAB 1: PERSONAL PREFERENCES */}
              <TabsContent value="personal" className="mt-0 space-y-6">
                {/* 1. Language Preference */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-0.5">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Languages className="size-4 text-primary" />
                      <span>{t('room.settingsDialog.languageTitle', 'Ngôn ngữ')}</span>
                    </Label>
                    <span className="text-xs text-muted-foreground leading-normal">
                      {t(
                        'room.settingsDialog.languageDesc',
                        'Chọn ngôn ngữ hiển thị trên toàn bộ giao diện của bạn',
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLanguage('vi')}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        language === 'vi'
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs'
                          : 'border-border/70 hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">🇻🇳</span>
                        <span>{t('room.settingsDialog.langVi', 'Tiếng Việt')}</span>
                      </div>
                      {language === 'vi' && <Check className="size-4 text-primary shrink-0" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        language === 'en'
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs'
                          : 'border-border/70 hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">🇬🇧</span>
                        <span>{t('room.settingsDialog.langEn', 'English')}</span>
                      </div>
                      {language === 'en' && <Check className="size-4 text-primary shrink-0" />}
                    </button>
                  </div>
                </div>

                <div className="h-px w-full bg-border/60" />

                {/* 2. Theme Preference */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-0.5">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Sun className="size-4 text-amber-500 dark:hidden" />
                      <Moon className="size-4 text-sky-400 hidden dark:inline" />
                      <span>{t('room.settingsDialog.themeTitle', 'Giao diện')}</span>
                    </Label>
                    <span className="text-xs text-muted-foreground leading-normal">
                      {t('room.settingsDialog.themeDesc', 'Chọn chế độ hiển thị sáng hoặc tối')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs'
                          : 'border-border/70 hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <Sun className="size-4 text-amber-500" />
                      <span>{t('room.settingsDialog.themeLight', 'Sáng')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs'
                          : 'border-border/70 hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <Moon className="size-4 text-sky-400" />
                      <span>{t('room.settingsDialog.themeDark', 'Tối')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        theme === 'system'
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs'
                          : 'border-border/70 hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <Laptop className="size-4 text-muted-foreground" />
                      <span>{t('room.settingsDialog.themeSystem', 'Hệ thống')}</span>
                    </button>
                  </div>
                </div>

                <div className="h-px w-full bg-border/60" />

                {/* 3. Role Selection */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-0.5">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Sliders className="size-4 text-primary" />
                      <span>{t('room.settingsDialog.roleTitle', 'Vai trò trong phòng')}</span>
                    </Label>
                    <span className="text-xs text-muted-foreground leading-normal">
                      {t(
                        'room.settingsDialog.roleDesc',
                        'Chuyển đổi giữa chế độ bỏ phiếu ước lượng hoặc chỉ quan sát',
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Estimator */}
                    <button
                      type="button"
                      disabled={isSwitchingRole}
                      onClick={() => onSwitchRole?.(false)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-60 ${
                        !isCurrentSpectator
                          ? 'border-emerald-500/70 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500/30 shadow-xs'
                          : 'border-border/70 hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        {isSwitchingRole && isCurrentSpectator ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <UserCheck className="size-4" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-sm">
                          <span>
                            {t('room.settingsDialog.roleEstimator', 'Thành viên ước lượng')}
                          </span>
                          {!isCurrentSpectator && (
                            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-none text-xs px-1.5 py-0">
                              Active
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground leading-normal">
                          {t(
                            'room.settingsDialog.roleEstimatorDesc',
                            'Tham gia bỏ phiếu và ước lượng độ phức tạp thẻ bài',
                          )}
                        </span>
                      </div>
                    </button>

                    {/* Option 2: Spectator */}
                    <button
                      type="button"
                      disabled={isSwitchingRole}
                      onClick={() => onSwitchRole?.(true)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-60 ${
                        isCurrentSpectator
                          ? 'border-sky-500/70 bg-sky-500/10 text-sky-950 dark:text-sky-200 ring-1 ring-sky-500/30 shadow-xs'
                          : 'border-border/70 hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-center size-8 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5">
                        {isSwitchingRole && !isCurrentSpectator ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-sm">
                          <span>{t('room.settingsDialog.roleSpectator', 'Người quan sát')}</span>
                          {isCurrentSpectator && (
                            <Badge className="bg-sky-500/20 text-sky-600 dark:text-sky-400 border-none text-xs px-1.5 py-0">
                              Active
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground leading-normal">
                          {t(
                            'room.settingsDialog.roleSpectatorDesc',
                            'Chỉ theo dõi tiến trình, không tham gia bỏ phiếu',
                          )}
                        </span>
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
                      className="text-sm font-semibold text-foreground flex items-center justify-between"
                    >
                      <span>{t('room.settingsDialog.roomNameLabel', 'Tên phòng')}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {roomName.length}/100
                      </span>
                    </Label>
                    <Input
                      id="room-name-input"
                      value={roomName}
                      maxLength={100}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder={t(
                        'room.settingsDialog.roomNamePlaceholder',
                        'Nhập tên phòng ước lượng...',
                      )}
                      className="h-10 text-sm rounded-xl bg-background border-border/80"
                    />
                  </div>

                  {/* Estimation Deck Selection */}
                  <div className="space-y-3">
                    <div className="flex flex-col gap-0.5">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        <span>{t('room.settingsDialog.deckLabel', 'Bộ bài ước lượng')}</span>
                      </Label>
                      <span className="text-xs text-muted-foreground leading-normal">
                        {t(
                          'room.settingsDialog.deckDesc',
                          'Chọn bộ thang điểm ước lượng áp dụng cho cả phòng',
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DECK_CONFIGS.map((deck) => {
                        const isSelected = selectedDeck === deck.id;
                        return (
                          <button
                            key={deck.id}
                            type="button"
                            onClick={() => setSelectedDeck(deck.id)}
                            className={`flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs'
                                : 'border-border/70 hover:bg-muted/40 text-foreground'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm text-foreground">
                                {t(`decks.${deck.translationKey}.name`)}
                              </span>
                              {isSelected && <Check className="size-4 text-primary" />}
                            </div>

                            <p className="text-xs text-muted-foreground leading-normal mb-2 line-clamp-1">
                              {t(`decks.${deck.translationKey}.description`)}
                            </p>

                            <div className="flex flex-wrap gap-1 items-center">
                              {deck.cards.slice(0, 7).map((cardVal, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60"
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
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Warning banner if changing deck during active round */}
                  {isDeckChanged && hasAnyActiveVotes && (
                    <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                      <AlertTriangle className="size-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <span className="font-semibold block mb-0.5">
                          {t('room.settingsDialog.resetConfirmTitle', 'Lưu ý đổi bộ bài')}
                        </span>
                        {t(
                          'room.settingsDialog.resetConfirmDesc',
                          'Vòng hiện tại đang có thành viên đã ước lượng. Việc đổi bộ bài sẽ xóa sạch các thẻ đã chọn trong vòng này để đảm bảo tính tương thích.',
                        )}
                      </div>
                    </div>
                  )}

                  {/* Save button */}
                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={handleSaveRoomConfig}
                      disabled={isSavingRoom || !hasRoomChanges}
                      className="h-10 px-5 text-sm font-semibold rounded-xl cursor-pointer shadow-xs gap-2"
                    >
                      {isSavingRoom ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>{t('room.settingsDialog.saving', 'Đang lưu...')}</span>
                        </>
                      ) : (
                        <span>{t('room.settingsDialog.saveChanges', 'Lưu thay đổi')}</span>
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
        <AlertDialogContent className="sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5 text-destructive" />
              <span>
                {t('room.settingsDialog.resetConfirmTitle', 'Làm mới lượt ước lượng hiện tại?')}
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t(
                'room.settingsDialog.resetConfirmDesc',
                'Vòng ước lượng hiện tại đang diễn ra và đã có thành viên gửi thẻ bài. Việc đổi bộ bài sẽ xóa sạch các thẻ bài đã chọn trong vòng này để đảm bảo dữ liệu tương thích. Bạn có chắc chắn muốn đổi không?',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="h-9 rounded-xl text-sm font-medium cursor-pointer">
              {t('room.settingsDialog.resetConfirmCancel', 'Hủy')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeSaveRoomConfig}
              className="h-9 rounded-xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {t('room.settingsDialog.resetConfirmAction', 'Đổi bộ bài & Làm mới')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
