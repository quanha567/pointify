import { useRef } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { Plus, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MorphingText } from '@/components/ui/morphing-text';
import { WordReveal } from '@/components/word-reveal';
import { FloatingShapes } from '@/components/floating-shapes';
import {
  CreateRoomModal,
  type CreateRoomModalHandle,
} from '@/features/room/components/create-room-modal';
import {
  JoinRoomModal,
  type JoinRoomModalHandle,
} from '@/features/room/components/join-room-modal';

export const Route = createFileRoute('/')({
  component: DashboardHomePage,
});

function DashboardHomePage() {
  const { t } = useTranslation();
  const createRef = useRef<CreateRoomModalHandle>(null);
  const joinRef = useRef<JoinRoomModalHandle>(null);

  const morphingTexts = t('app.morphingTexts', { returnObjects: true }) as string[];

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
            <motion.div layoutId="create-room-modal" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 cursor-pointer rounded-2xl h-13 px-8 transition-shadow"
                onClick={() => createRef.current?.open()}
              >
                <Plus className="size-5" />
                <span>{t('createRoom.cta')}</span>
              </Button>
            </motion.div>

            {/* Join Room — Outline */}
            <motion.div layoutId="join-room-modal" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 text-base font-semibold cursor-pointer rounded-2xl h-13 px-8 border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-all"
                onClick={() => joinRef.current?.open()}
              >
                <span>{t('joinRoom.cta')}</span>
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </motion.div>
        </LayoutGroup>
      </div>

      {/* Encapsulated Room Modals */}
      <AnimatePresence>
        <CreateRoomModal ref={createRef} />
        <JoinRoomModal ref={joinRef} />
      </AnimatePresence>
    </div>
  );
}
