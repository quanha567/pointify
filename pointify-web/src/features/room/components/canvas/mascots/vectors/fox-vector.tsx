import { memo } from 'react';
import { motion } from 'motion/react';

interface VectorProps {
  isOffline?: boolean;
}

export const FoxVector = memo(function FoxVector({ isOffline }: VectorProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fox Body */}
      <motion.ellipse
        cx="32"
        cy="43"
        rx="17"
        ry="14"
        fill="#F97316"
        animate={isOffline ? {} : { ry: [14, 14.6, 14] }}
        transition={{ repeat: Infinity, duration: 2.3, ease: 'easeInOut' }}
      />
      {/* White Chest */}
      <polygon points="32,36 26,48 38,48" fill="#FFFFFF" />

      {/* Bushy Fox Tail with white tip */}
      <motion.g
        animate={isOffline ? {} : { rotate: [-4, 6, -4] }}
        style={{ transformOrigin: '46px 45px' }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
      >
        <path d="M46 45C52 45 58 40 57 32C56 28 51 28 50 33C49 37 46 41 44 43" fill="#F97316" />
        <path
          d="M57 32C56 28 51 28 50 33C52 32 54 34 55 36C56 35 56.5 33.5 57 32Z"
          fill="#FFFFFF"
        />
      </motion.g>

      {/* Head Group */}
      <motion.g
        animate={isOffline ? { y: 2, rotate: -4 } : { rotate: [3, -2, 3], y: [0, -1, 0] }}
        style={{ transformOrigin: '32px 30px' }}
        transition={{ repeat: Infinity, duration: 2.7, ease: 'easeInOut' }}
      >
        {/* Tall Triangular Ears */}
        <polygon points="18,25 15,10 26,17" fill="#F97316" />
        <polygon points="18,22 17,13 24,18" fill="#18181B" />

        <polygon points="46,25 49,10 38,17" fill="#F97316" />
        <polygon points="46,22 47,13 40,18" fill="#18181B" />

        {/* Head */}
        <polygon points="32,38 17,25 47,25" fill="#F97316" />
        <ellipse cx="32" cy="25" rx="15" ry="10" fill="#F97316" />

        {/* White Cheek Tufts */}
        <polygon points="32,38 17,28 24,34" fill="#FFFFFF" />
        <polygon points="32,38 47,28 40,34" fill="#FFFFFF" />

        {/* Cheeks */}
        <ellipse cx="23" cy="29" rx="2" ry="1.2" fill="#FCA5A5" opacity="0.6" />
        <ellipse cx="41" cy="29" rx="2" ry="1.2" fill="#FCA5A5" opacity="0.6" />

        {/* Eyes */}
        {isOffline ? (
          <>
            <path
              d="M23 25C24.5 24 26.5 24 28 25"
              stroke="#431407"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M36 25C37.5 24 39.5 24 41 25"
              stroke="#431407"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <motion.ellipse
              cx="25"
              cy="25"
              rx="2"
              ry="2.4"
              fill="#18181B"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 3.6, times: [0, 0.9, 0.95, 1] }}
            />
            <circle cx="26" cy="24" r="0.7" fill="white" />

            <motion.ellipse
              cx="39"
              cy="25"
              rx="2"
              ry="2.4"
              fill="#18181B"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 3.6, times: [0, 0.9, 0.95, 1] }}
            />
            <circle cx="40" cy="24" r="0.7" fill="white" />
          </>
        )}

        {/* Black Nose */}
        <ellipse cx="32" cy="36" rx="2" ry="1.5" fill="#18181B" />
      </motion.g>

      {/* Paws */}
      <ellipse cx="25" cy="52" rx="3.5" ry="2.5" fill="#18181B" />
      <ellipse cx="39" cy="52" rx="3.5" ry="2.5" fill="#18181B" />
    </svg>
  );
});
