import { memo } from 'react';
import { motion } from 'motion/react';

interface VectorProps {
  isOffline?: boolean;
}

export const BearVector = memo(function BearVector({ isOffline }: VectorProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bear Body */}
      <motion.ellipse
        cx="32"
        cy="43"
        rx="19"
        ry="15"
        fill="#854D0E"
        animate={isOffline ? {} : { ry: [15, 15.7, 15] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
      />
      {/* Light belly */}
      <ellipse cx="32" cy="45" rx="12" ry="10" fill="#FEF08A" opacity="0.85" />

      {/* Head Group */}
      <motion.g
        animate={isOffline ? { y: 2, rotate: 3 } : { rotate: [-2, 3, -2], y: [0, -0.8, 0] }}
        style={{ transformOrigin: '32px 30px' }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
      >
        {/* Round Bear Ears */}
        <circle cx="18" cy="18" r="6.5" fill="#854D0E" />
        <circle cx="18" cy="18" r="3.5" fill="#FEF08A" opacity="0.85" />

        <circle cx="46" cy="18" r="6.5" fill="#854D0E" />
        <circle cx="46" cy="18" r="3.5" fill="#FEF08A" opacity="0.85" />

        {/* Head */}
        <ellipse cx="32" cy="27" rx="16" ry="13" fill="#854D0E" />

        {/* Muzzle */}
        <ellipse cx="32" cy="30" rx="8" ry="6" fill="#FEF08A" opacity="0.9" />

        {/* Cheeks */}
        <ellipse cx="20" cy="29" rx="2.5" ry="1.5" fill="#FCA5A5" opacity="0.6" />
        <ellipse cx="44" cy="29" rx="2.5" ry="1.5" fill="#FCA5A5" opacity="0.6" />

        {/* Eyes */}
        {isOffline ? (
          <>
            <path
              d="M22 24C23.5 22.5 25.5 22.5 27 24"
              stroke="#422006"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M37 24C38.5 22.5 40.5 22.5 42 24"
              stroke="#422006"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <motion.circle
              cx="24"
              cy="23"
              r="2"
              fill="#422006"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 4.2, times: [0, 0.9, 0.95, 1] }}
            />
            <circle cx="25" cy="22" r="0.7" fill="white" />

            <motion.circle
              cx="40"
              cy="23"
              r="2"
              fill="#422006"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 4.2, times: [0, 0.9, 0.95, 1] }}
            />
            <circle cx="41" cy="22" r="0.7" fill="white" />
          </>
        )}

        {/* Nose & Mouth */}
        <ellipse cx="32" cy="28" rx="2.5" ry="1.8" fill="#422006" />
        <path
          d="M32 30V32M30 32C31 33 33 33 34 32"
          stroke="#422006"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Paws */}
      <circle cx="23" cy="52" r="4.5" fill="#854D0E" stroke="#713F12" strokeWidth="1" />
      <circle cx="41" cy="52" r="4.5" fill="#854D0E" stroke="#713F12" strokeWidth="1" />
    </svg>
  );
});
