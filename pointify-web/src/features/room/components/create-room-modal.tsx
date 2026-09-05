import { Hash, SlidersHorizontal, User, Users, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormInput,
  FormSubmitButton,
  useAppForm,
  useStore,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TypographyH4, TypographyMuted } from '@/components/ui/typography';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { useAuthStore } from '@/store/useAuthStore';
import { useCreateRoomMutation } from '../api/use-room';
import { DECK_CONFIGS } from '../constants/deck-configs';
import type { DeckType } from '../types/room.types';

const createRoomSchema = z.object({
  roomName: z.string().optional(),
  creatorName: z.string().trim().min(1, 'createRoom.errorNameRequired'),
  selectedDeck: z.enum(['fibonacci', 'modified-fibonacci', 't-shirt', 'powers-of-2']),
  creatorRole: z.enum(['estimator', 'spectator']),
});

type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export interface CreateRoomModalHandle {
  open: () => void;
  close: () => void;
}

interface CreateRoomModalProps {
  ref?: React.Ref<CreateRoomModalHandle>;
  onClose?: () => void;
}

export function CreateRoomModal({ ref, onClose }: CreateRoomModalProps) {
  const { t } = useTranslation();
  const { user, isGuest, guestName, continueAsGuest } = useAuthStore();
  const currentUserName = user?.displayName || (isGuest ? guestName : '') || '';

  const [isOpen, setIsOpen] = useState(false);

  useLockBodyScroll(isOpen);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const createRoomMutation = useCreateRoomMutation({
    onSuccess: () => {
      handleClose();
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const form = useAppForm<CreateRoomFormValues>({
    defaultValues: {
      roomName: '',
      creatorName: currentUserName,
      selectedDeck: 'fibonacci',
      creatorRole: 'estimator',
    },
    schema: createRoomSchema,
    onSubmit: async ({ value }) => {
      const finalRoomName = value.roomName?.trim() || 'Sprint Planning';
      const trimmedCreatorName = value.creatorName.trim();

      if (!user && trimmedCreatorName) {
        continueAsGuest(trimmedCreatorName);
      }

      await createRoomMutation.mutateAsync({
        name: finalRoomName,
        deckType: value.selectedDeck as DeckType,
        facilitator: {
          id: user?.uid,
          displayName: trimmedCreatorName,
          photoURL: user?.photoURL || null,
          isGuest: !user,
        },
      });
    },
  });

  const selectedDeck = useStore(form.store, (state: any) => state.values?.selectedDeck) as DeckType;

  const currentDeckConfig = DECK_CONFIGS.find((d) => d.id === selectedDeck) || DECK_CONFIGS[0];

  useImperativeHandle(ref, () => ({
    open: () => {
      form.reset();
      if (currentUserName) {
        form.setFieldValue('creatorName', currentUserName);
      }
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      onClose?.();
    },
  }));

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <motion.div
        layoutId="create-room-modal"
        className="fixed z-50 top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card border border-border/80 shadow-2xl p-6 sm:p-7 max-h-[calc(100dvh-2rem)] overflow-y-auto"
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-7 items-stretch">
          {/* Left Column: Form */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <TypographyH4 className="text-xl font-bold tracking-tight">
                    {t('createRoom.modalTitle')}
                  </TypographyH4>
                  <TypographyMuted className="mt-0.5">
                    {t('createRoom.modalDescription')}
                  </TypographyMuted>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClose}
                  className="md:hidden rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <Form form={form} className="space-y-4">
                {/* Room Name */}
                <FormInput
                  name="roomName"
                  label={t('createRoom.fieldRoomName')}
                  prefix={<Hash className="size-3.5 text-primary" />}
                  placeholder={t('createRoom.fieldRoomNamePlaceholder')}
                  className="rounded-xl h-10 text-sm bg-muted/30 focus-visible:bg-background"
                />

                {/* Creator Name */}
                <FormInput
                  name="creatorName"
                  label={t('createRoom.fieldCreatorName')}
                  prefix={<User className="size-3.5 text-primary" />}
                  placeholder={t('createRoom.fieldCreatorNamePlaceholder')}
                  className="rounded-xl h-10 text-sm bg-muted/30 focus-visible:bg-background"
                  required
                  autoFocus
                />

                {/* Deck Selection via generic FormField */}
                <FormField
                  name="selectedDeck"
                  label={
                    <span className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                      <SlidersHorizontal className="size-3.5 text-primary" />
                      <span>{t('createRoom.fieldDeck')}</span>
                    </span>
                  }
                >
                  {(field) => (
                    <div className="grid grid-cols-2 gap-2">
                      {DECK_CONFIGS.map((deck) => {
                        const isSelected = field.state.value === deck.id;
                        return (
                          <button
                            type="button"
                            key={deck.id}
                            onClick={() => field.handleChange(deck.id)}
                            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                : 'border-border/70 bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:border-border'
                            }`}
                          >
                            {t(`decks.${deck.translationKey}.name`)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </FormField>

                {/* Role Selection via generic FormField */}
                <FormField name="creatorRole">
                  {(field) => {
                    const isSpectator = field.state.value === 'spectator';
                    return (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20">
                        <div className="space-y-0.5 pr-4">
                          <label
                            htmlFor="spectator-role-switch"
                            className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer"
                          >
                            <Users className="size-3.5 text-primary" />
                            <span>{t('createRoom.spectatorModeTitle')}</span>
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {isSpectator
                              ? t('createRoom.spectatorModeActiveDesc')
                              : t('createRoom.spectatorModeInactiveDesc')}
                          </p>
                        </div>

                        <Switch
                          id="spectator-role-switch"
                          checked={isSpectator}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked ? 'spectator' : 'estimator')
                          }
                          className="cursor-pointer shrink-0"
                        />
                      </div>
                    );
                  }}
                </FormField>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    {t('createRoom.cancel')}
                  </Button>
                  <FormSubmitButton>{t('createRoom.submit')}</FormSubmitButton>
                </div>
              </Form>
            </div>
          </div>

          {/* Right Column: Deck Illustration Showcase */}
          <div className="hidden md:flex md:col-span-5 flex-col items-center justify-center relative">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleClose}
              className="absolute top-0 right-0 z-10 rounded-xl bg-background/80 hover:bg-background backdrop-blur-md border border-border/60 text-muted-foreground hover:text-foreground shadow-xs"
            >
              <X className="size-4" />
            </Button>

            <div className="w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-border/70 bg-gradient-to-b from-muted/30 to-muted/10 relative flex items-center justify-center p-2 group shadow-inner">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDeck}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="w-full h-full flex items-center justify-center relative rounded-xl overflow-hidden"
                >
                  <img
                    src={currentDeckConfig.image}
                    alt={t(`decks.${currentDeckConfig.translationKey}.name`)}
                    className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
