import { memo } from 'react';
import { motion } from 'motion/react';

export const ComicThoughtBubble = memo(function ComicThoughtBubble() {
  return (
    <motion.div
      className="absolute -top-6 -right-3 z-30 pointer-events-none select-none flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.7, y: 4 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -3, 0],
        rotate: [0, 1.5, -1.5, 0],
      }}
      transition={{
        y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
        rotate: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
        opacity: { duration: 0.3 },
      }}
    >
      {/* ── Main Comic Cloud Bubble ── */}
      <div className="relative">
        <svg
          viewBox="0 0 54 36"
          className="w-15 h-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.14)] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cloud Body Shape */}
          <path
            d="M12 28C7.5 28 4 24.5 4 20C4 16.5 6.5 13.5 10 12.5C9.5 9 12 5.5 16 4.5C20 3.5 24 5 26 8C28.5 5 32.5 4.5 36 6.5C39.5 8.5 41 12 40.5 15C44 15.5 47 18.5 47 22C47 25.5 44 28.5 40 28.5C38 28.5 14 28 12 28Z"
            className="fill-background stroke-primary/30"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Cloud Inner Highlight */}
          <path
            d="M13 14C12 9 17 6.5 21 6C25 5.5 28 7.5 29 8"
            className="stroke-primary/20"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>

        {/* ── Content inside cloud: Playful Wave Dots + Question Mark ── */}
        <div className="absolute inset-0 flex items-center justify-center pt-0.5 pr-1">
          <div className="flex items-center gap-1">
            <motion.span
              animate={{
                y: [0, -3, 0],
                opacity: [0.4, 1, 0.4],
                scale: [0.9, 1.2, 0.9],
              }}
              transition={{ repeat: Infinity, duration: 1.4, delay: 0, ease: 'easeInOut' }}
              className="size-1.5 rounded-full bg-primary"
            />
            <motion.span
              animate={{
                y: [0, -3, 0],
                opacity: [0.4, 1, 0.4],
                scale: [0.9, 1.2, 0.9],
              }}
              transition={{ repeat: Infinity, duration: 1.4, delay: 0.2, ease: 'easeInOut' }}
              className="size-1.5 rounded-full bg-primary"
            />
            <motion.span
              animate={{
                y: [0, -3, 0],
                opacity: [0.4, 1, 0.4],
                scale: [0.9, 1.2, 0.9],
              }}
              transition={{ repeat: Infinity, duration: 1.4, delay: 0.4, ease: 'easeInOut' }}
              className="size-1.5 rounded-full bg-primary"
            />
          </div>
        </div>
      </div>

      {/* ── Tail: 2 Small Connecting Bubbles leading down to Mascot ── */}
      <div className="flex flex-col items-start -mt-0.5 ml-2 gap-0.5">
        {/* Middle bubble */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.2 }}
          className="size-2 rounded-full bg-background border border-primary/35 shadow-2xs ml-1"
        />
        {/* Tiny lowest bubble */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.95, 0.6],
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.4 }}
          className="size-1.5 rounded-full bg-background border border-primary/40 shadow-2xs"
        />
      </div>
    </motion.div>
  );
});
