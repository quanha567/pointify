import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { toast } from 'sonner';
import {
  Plus,
  LogIn as LogInIcon,
  Users,
  Eye,
  X,
  Check,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MorphingText } from '@/components/ui/morphing-text';
import { WordReveal } from '@/components/WordReveal';
import { FloatingShapes } from '@/components/FloatingShapes';
import { useAppStore, type DeckType, type ParticipantRole } from '@/store/useAppStore';

export const Route = createFileRoute('/')({
  component: DashboardHomePage,
});

// ─── Deck configs (used inside Create Room modal) ───────────────────────────

interface DeckConfig {
  id: DeckType;
  translationKey: 'fibonacci' | 'modified-fibonacci' | 't-shirt' | 'powers-of-2';
  cards: string[];
}

const DECK_CONFIGS: DeckConfig[] = [
  {
    id: 'fibonacci',
    translationKey: 'fibonacci',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?'],
  },
  {
    id: 'modified-fibonacci',
    translationKey: 'modified-fibonacci',
    cards: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'],
  },
  {
    id: 't-shirt',
    translationKey: 't-shirt',
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?'],
  },
  {
    id: 'powers-of-2',
    translationKey: 'powers-of-2',
    cards: ['0', '1', '2', '4', '8', '16', '32', '64', '?'],
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

function DashboardHomePage() {
  const { t } = useTranslation();
  const { addRecentRoom } = useAppStore();

  // Modal state
  const [activeModal, setActiveModal] = React.useState<'create' | 'join' | null>(null);

  // Create form
  const [roomName, setRoomName] = React.useState('');
  const [creatorName, setCreatorName] = React.useState('');
  const [selectedDeck, setSelectedDeck] = React.useState<DeckType>('fibonacci');
  const [creatorRole, setCreatorRole] = React.useState<ParticipantRole>('estimator');

  // Join form
  const [joinCode, setJoinCode] = React.useState('');
  const [joinName, setJoinName] = React.useState('');
  const [joinRole, setJoinRole] = React.useState<ParticipantRole>('estimator');

  const morphingTexts = t('app.morphingTexts', { returnObjects: true }) as string[];
  const currentDeckConfig = DECK_CONFIGS.find((d) => d.id === selectedDeck) || DECK_CONFIGS[0];

  const generateRoomCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PT-${randomNum}`;
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName.trim()) {
      toast.error(t('createRoom.errorNameRequired'));
      return;
    }

    const newCode = generateRoomCode();
    const finalRoomName = roomName.trim() || 'Sprint Planning';

    addRecentRoom({
      code: newCode,
      name: finalRoomName,
      deckType: selectedDeck,
      lastVisited: t('recentRooms.justNow'),
      role: creatorRole,
    });

    toast.success(t('createRoom.successToast', { name: finalRoomName, code: newCode }));
    setActiveModal(null);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error(t('joinRoom.errorCodeRequired'));
      return;
    }
    if (!joinName.trim()) {
      toast.error(t('joinRoom.errorNameRequired'));
      return;
    }

    const formattedCode = joinCode.trim().toUpperCase();
    const roleLabel = joinRole === 'estimator' ? t('roles.estimator') : t('roles.spectator');

    addRecentRoom({
      code: formattedCode,
      name: `Room ${formattedCode}`,
      deckType: 'fibonacci',
      lastVisited: t('recentRooms.justNow'),
      role: joinRole,
    });

    toast.success(t('joinRoom.successToast', { code: formattedCode, role: roleLabel }));
    setActiveModal(null);
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* Floating shapes background */}
      <FloatingShapes />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-5 max-w-3xl mx-auto py-20 sm:py-28">
        {/* Full-sentence morphing title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full"
        >
          <MorphingText
            texts={morphingTexts}
            className="text-foreground h-10 sm:h-12 md:h-14 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight whitespace-nowrap"
          />
        </motion.div>

        {/* Word-by-word description */}
        <div className="text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed mt-2">
          <WordReveal text={t('app.subtitle')} delay={0.8} staggerDelay={0.04} />
        </div>

        {/* CTA Buttons */}
        <LayoutGroup>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4 w-full sm:w-auto"
          >
            {/* Create Room — Primary */}
            {activeModal !== 'create' && (
              <motion.div layoutId="create-room-modal" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 cursor-pointer rounded-2xl h-13 px-8 transition-shadow"
                  onClick={() => setActiveModal('create')}
                >
                  <Plus className="size-5" />
                  <span>{t('createRoom.cta')}</span>
                </Button>
              </motion.div>
            )}

            {/* Join Room — Outline */}
            {activeModal !== 'join' && (
              <motion.div layoutId="join-room-modal" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto gap-2 text-base font-semibold cursor-pointer rounded-2xl h-13 px-8 border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  onClick={() => setActiveModal('join')}
                >
                  <span>{t('joinRoom.cta')}</span>
                  <ArrowRight className="size-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </LayoutGroup>
      </div>

      {/* Modal Overlay + Morphing Modals */}
      <AnimatePresence>
        {activeModal && (
          <>
            {/* Blur + Dim Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Create Room Modal */}
            {activeModal === 'create' && (
              <motion.div
                layoutId="create-room-modal"
                className="fixed z-50 top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card border border-border/80 shadow-2xl p-6 sm:p-8"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {t('createRoom.modalTitle')}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('createRoom.modalDescription')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="size-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateRoom} className="space-y-5">
                  {/* Room Name */}
                  <div className="space-y-2">
                    <Label htmlFor="room-name" className="text-sm font-medium">
                      {t('createRoom.fieldRoomName')}
                    </Label>
                    <Input
                      id="room-name"
                      placeholder={t('createRoom.fieldRoomNamePlaceholder')}
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>

                  {/* Creator Name */}
                  <div className="space-y-2">
                    <Label htmlFor="creator-name" className="text-sm font-medium">
                      {t('createRoom.fieldCreatorName')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="creator-name"
                      placeholder={t('createRoom.fieldCreatorNamePlaceholder')}
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="rounded-xl h-11"
                      required
                    />
                  </div>

                  {/* Deck Selection */}
                  <div className="space-y-2.5">
                    <Label className="text-sm font-medium">{t('createRoom.fieldDeck')}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {DECK_CONFIGS.map((deck) => {
                        const isSelected = selectedDeck === deck.id;
                        return (
                          <button
                            type="button"
                            key={deck.id}
                            onClick={() => setSelectedDeck(deck.id)}
                            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs'
                                : 'border-border/80 hover:bg-muted/50'
                            }`}
                          >
                            <div className="font-bold text-xs text-foreground flex items-center justify-between w-full">
                              <span>{t(`decks.${deck.translationKey}.name`)}</span>
                              {isSelected && <Check className="size-3.5 text-primary" />}
                            </div>
                            <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {t(`decks.${deck.translationKey}.description`)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Deck Preview */}
                    <div className="rounded-xl bg-muted/40 p-3 border border-border/60">
                      <div className="flex items-center gap-1.5 mb-2">
                        <SlidersHorizontal className="size-3.5 text-primary" />
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {t('createRoom.deckCards')}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-bold ml-auto">
                          {t(`decks.${currentDeckConfig.translationKey}.name`)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentDeckConfig.cards.map((c, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center justify-center min-w-7 h-8 px-2 rounded-lg bg-background border border-border/80 text-xs font-bold text-foreground"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('createRoom.fieldRole')}</Label>
                    <Tabs
                      value={creatorRole}
                      onValueChange={(val) => setCreatorRole(val as ParticipantRole)}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 rounded-xl h-10 p-1">
                        <TabsTrigger
                          value="estimator"
                          className="gap-1.5 text-xs font-medium rounded-lg"
                        >
                          <Users className="size-3.5" />
                          <span>{t('createRoom.roleEstimator')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="spectator"
                          className="gap-1.5 text-xs font-medium rounded-lg"
                        >
                          <Eye className="size-3.5" />
                          <span>{t('createRoom.roleSpectator')}</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModal}
                      className="rounded-xl cursor-pointer"
                    >
                      {t('createRoom.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="gap-2 rounded-xl shadow-md shadow-primary/20 cursor-pointer"
                    >
                      <Plus className="size-4" />
                      <span>{t('createRoom.submit')}</span>
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Join Room Modal */}
            {activeModal === 'join' && (
              <motion.div
                layoutId="join-room-modal"
                className="fixed z-50 top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card border border-border/80 shadow-2xl p-6 sm:p-8"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{t('joinRoom.title')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('joinRoom.description')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="size-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <form onSubmit={handleJoinRoom} className="space-y-5">
                  {/* Room Code */}
                  <div className="space-y-2">
                    <Label htmlFor="join-code" className="text-sm font-medium">
                      {t('joinRoom.fieldCode')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="join-code"
                      placeholder={t('joinRoom.fieldCodePlaceholder')}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="font-mono uppercase tracking-wider text-base rounded-xl h-11 border-border/80"
                      required
                    />
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="join-name" className="text-sm font-medium">
                      {t('joinRoom.fieldName')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="join-name"
                      placeholder={t('joinRoom.fieldNamePlaceholder')}
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      className="rounded-xl h-11 border-border/80"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('joinRoom.fieldRole')}</Label>
                    <Tabs
                      value={joinRole}
                      onValueChange={(val) => setJoinRole(val as ParticipantRole)}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 rounded-xl h-10 p-1">
                        <TabsTrigger
                          value="estimator"
                          className="gap-1.5 text-xs font-medium rounded-lg"
                        >
                          <Users className="size-3.5" />
                          <span>{t('roles.estimator')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="spectator"
                          className="gap-1.5 text-xs font-medium rounded-lg"
                        >
                          <Eye className="size-3.5" />
                          <span>{t('roles.spectator')}</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModal}
                      className="rounded-xl cursor-pointer"
                    >
                      {t('createRoom.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="gap-2 rounded-xl shadow-md shadow-primary/20 cursor-pointer"
                    >
                      <LogInIcon className="size-4" />
                      <span>{t('joinRoom.cta')}</span>
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
