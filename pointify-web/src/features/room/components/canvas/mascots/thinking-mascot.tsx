import { memo } from 'react';
import { motion } from 'motion/react';
import { getMascotForParticipant, getMascotFromPhotoUrl, MASCOT_LIST } from './mascot-registry';
import { ComicThoughtBubble } from './comic-thought-bubble';

interface ThinkingMascotProps {
  participantId: string;
  isOnline?: boolean;
  photoURL?: string | null;
}

export const ThinkingMascot = memo(function ThinkingMascot({
  participantId,
  isOnline = true,
  photoURL,
}: ThinkingMascotProps) {
  const customMascot = getMascotFromPhotoUrl(photoURL);
  const mascotId = customMascot ? customMascot.id : getMascotForParticipant(participantId);
  const mascotInfo = customMascot ?? MASCOT_LIST.find((m) => m.id === mascotId) ?? MASCOT_LIST[0];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none pt-2">
      {/* ── Offline Sleeping Zzz bubble ────────────────────── */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 1, 0],
            y: [-2, -14, -22],
            x: [0, 6, 12],
            scale: [0.8, 1.1, 0.9],
          }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeOut' }}
          className="absolute -top-3 right-1 text-[11px] font-black tracking-widest text-muted-foreground/70 pointer-events-none select-none z-20"
        >
          Zzz...
        </motion.div>
      )}

      {/* ── Online Thinking Bubble: Comic Cloud with connection bubbles ── */}
      {isOnline && <ComicThoughtBubble />}

      {/* ── 3D Character Container ─────────────────────────── */}
      <motion.div
        className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-all duration-300 ${
          isOnline ? 'filter-none' : 'grayscale opacity-50'
        }`}
        animate={
          isOnline
            ? {
                y: [0, -3.5, 0],
                rotate: [-4, 4, -4],
              }
            : {
                y: 2,
                rotate: -6,
              }
        }
        transition={{
          repeat: Infinity,
          duration: 2.8,
          ease: 'easeInOut',
        }}
      >
        <img
          src={mascotInfo.imageSrc}
          alt={mascotInfo.nameVi}
          className="w-full h-full object-contain pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
          draggable={false}
          loading="eager"
        />
      </motion.div>

      {/* ── 3D Ground Contact Shadow (Bóng tiếp xúc sàn) ───── */}
      <motion.div
        className="w-8 h-2 rounded-full bg-black/15 dark:bg-black/35 blur-[1.5px] -mt-1 pointer-events-none"
        animate={
          isOnline
            ? {
                scale: [1, 0.82, 1],
                opacity: [0.35, 0.2, 0.35],
              }
            : {
                scale: 1,
                opacity: 0.2,
              }
        }
        transition={{
          repeat: Infinity,
          duration: 2.8,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
});
