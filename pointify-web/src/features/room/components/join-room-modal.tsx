import { useState, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, X, Users, Hash, User } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TypographyH4, TypographyMuted } from '@/components/ui/typography';
import { useAppForm, Form, FormInput, FormField, FormSubmitButton } from '@/components/form';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import type { ParticipantRole } from '../types/room.types';

const joinRoomSchema = z.object({
  roomCode: z.string().trim().min(1, 'joinRoom.errorCodeRequired'),
  participantName: z.string().trim().min(1, 'joinRoom.errorNameRequired'),
  participantRole: z.enum(['estimator', 'spectator']),
});

type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;

export interface JoinRoomModalHandle {
  open: () => void;
  close: () => void;
}

interface JoinRoomModalProps {
  ref?: React.Ref<JoinRoomModalHandle>;
  onClose?: () => void;
}

export function JoinRoomModal({ ref, onClose }: JoinRoomModalProps) {
  const { t } = useTranslation();
  const { addRecentRoom } = useAppStore();
  const { user, isGuest, guestName } = useAuthStore();
  const currentUserName = user?.displayName || (isGuest ? guestName : '') || '';

  const [isOpen, setIsOpen] = useState(false);

  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const form = useAppForm<JoinRoomFormValues>({
    defaultValues: {
      roomCode: '',
      participantName: currentUserName,
      participantRole: 'estimator',
    },
    schema: joinRoomSchema,
    onSubmit: async ({ value }) => {
      const formattedCode = value.roomCode.trim().toUpperCase();
      const roleLabel =
        value.participantRole === 'estimator' ? t('roles.estimator') : t('roles.spectator');

      addRecentRoom({
        code: formattedCode,
        name: `Room ${formattedCode}`,
        deckType: 'fibonacci',
        lastVisited: t('recentRooms.justNow'),
        role: value.participantRole as ParticipantRole,
      });

      toast.success(t('joinRoom.successToast', { code: formattedCode, role: roleLabel }));
      handleClose();
    },
  });

  useImperativeHandle(ref, () => ({
    open: () => {
      form.reset();
      if (currentUserName) {
        form.setFieldValue('participantName', currentUserName);
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
        layoutId="join-room-modal"
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
                    {t('joinRoom.modalTitle')}
                  </TypographyH4>
                  <TypographyMuted className="mt-0.5">
                    {t('joinRoom.modalDescription')}
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
                {/* Room Code */}
                <FormInput
                  name="roomCode"
                  label={t('joinRoom.fieldCode')}
                  prefix={<Hash className="size-3.5 text-primary" />}
                  placeholder={t('joinRoom.fieldCodePlaceholder')}
                  className="font-mono uppercase tracking-wider rounded-xl h-10 text-sm bg-muted/30 focus-visible:bg-background"
                  required
                  autoFocus
                />

                {/* Participant Display Name */}
                <FormInput
                  name="participantName"
                  label={t('joinRoom.fieldName')}
                  prefix={<User className="size-3.5 text-primary" />}
                  placeholder={t('joinRoom.fieldNamePlaceholder')}
                  className="rounded-xl h-10 text-sm bg-muted/30 focus-visible:bg-background"
                  required
                />

                {/* Role Selection via generic FormField */}
                <FormField name="participantRole">
                  {(field) => {
                    const isSpectator = field.state.value === 'spectator';
                    return (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20">
                        <div className="space-y-0.5 pr-4">
                          <label
                            htmlFor="join-spectator-role-switch"
                            className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer"
                          >
                            <Users className="size-3.5 text-primary" />
                            <span>{t('joinRoom.spectatorModeTitle')}</span>
                          </label>
                          <p className="text-[11px] text-muted-foreground">
                            {isSpectator
                              ? t('joinRoom.spectatorModeActiveDesc')
                              : t('joinRoom.spectatorModeInactiveDesc')}
                          </p>
                        </div>

                        <Switch
                          id="join-spectator-role-switch"
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="rounded-xl h-10 text-xs sm:text-sm cursor-pointer"
                  >
                    {t('joinRoom.cancel')}
                  </Button>
                  <FormSubmitButton className="gap-2 rounded-xl h-10 text-xs sm:text-sm shadow-md shadow-primary/20 cursor-pointer">
                    <LogIn className="size-4" />
                    <span>{t('joinRoom.submit')}</span>
                  </FormSubmitButton>
                </div>
              </Form>
            </div>
          </div>

          {/* Right Column: Illustration Showcase */}
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
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="w-full h-full flex items-center justify-center relative rounded-xl overflow-hidden"
                >
                  <img
                    src="/illustrations/join-room.jpg"
                    alt={t('joinRoom.modalTitle')}
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
