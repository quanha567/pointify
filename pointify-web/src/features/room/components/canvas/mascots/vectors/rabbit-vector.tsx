import { memo } from 'react';
import { motion } from 'motion/react';

interface VectorProps {
  isOffline?: boolean;
}

export const RabbitVector = memo(function RabbitVector({ isOffline }: VectorProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rabbit Body */}
      <motion.ellipse
        cx="32"
        cy="44"
        rx="16"
        ry="13.5"
        fill="#F4F4F5"
        stroke="#E4E4E7"
        strokeWidth="1.2"
        animate={isOffline ? {} : { ry: [13.5, 14.2, 13.5] }}
        transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
      />
      {/* Pink Belly */}
      <ellipse cx="32" cy="46" rx="10" ry="8" fill="#FCE7F3" opacity="0.6" />

      {/* Head Group with Long Ears */}
      <motion.g
        animate={isOffline ? { y: 2, rotate: 3 } : { rotate: [-2, 2, -2], y: [0, -1, 0] }}
        style={{ transformOrigin: '32px 32px' }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      >
        {/* Left Long Ear with wiggle */}
        <motion.g
          animate={isOffline ? {} : { rotate: [-3, 5, -3] }}
          style={{ transformOrigin: '24px 20px' }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        >
          <ellipse
            cx="23"
            cy="11"
            rx="4.5"
            ry="11"
            fill="#F4F4F5"
            stroke="#E4E4E7"
            strokeWidth="1"
          />
          <ellipse cx="23" cy="11" rx="2.5" ry="8.5" fill="#F472B6" opacity="0.55" />
        </motion.g>

        {/* Right Long Ear with wiggle */}
        <motion.g
          animate={isOffline ? {} : { rotate: [4, -4, 4] }}
          style={{ transformOrigin: '40px 20px' }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
        >
          <ellipse
            cx="41"
            cy="11"
            rx="4.5"
            ry="11"
            fill="#F4F4F5"
            stroke="#E4E4E7"
            strokeWidth="1"
          />
          <ellipse cx="41" cy="11" rx="2.5" ry="8.5" fill="#F472B6" opacity="0.55" />
        </motion.g>

        {/* Head */}
        <ellipse
          cx="32"
          cy="28"
          rx="14"
          ry="11.5"
          fill="#F4F4F5"
          stroke="#E4E4E7"
          strokeWidth="1.2"
        />

        {/* Pink Cheeks */}
        <ellipse cx="22" cy="30" rx="2.5" ry="1.5" fill="#F472B6" opacity="0.6" />
        <ellipse cx="42" cy="30" rx="2.5" ry="1.5" fill="#F472B6" opacity="0.6" />

        {/* Eyes */}
        {isOffline ? (
          <>
            <path
              d="M22 26C23.5 24.5 25.5 24.5 27 26"
              stroke="#27272A"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M37 26C38.5 24.5 40.5 24.5 42 26"
              stroke="#27272A"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <motion.ellipse
              cx="25"
              cy="25"
              rx="2.2"
              ry="2.6"
              fill="#BE185D"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 3.4, times: [0, 0.88, 0.94, 1] }}
            />
            <circle cx="26" cy="24" r="0.8" fill="white" />

            <motion.ellipse
              cx="39"
              cy="25"
              rx="2.2"
              ry="2.6"
              fill="#BE185D"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 3.4, times: [0, 0.88, 0.94, 1] }}
            />
            <circle cx="40" cy="24" r="0.8" fill="white" />
          </>
        )}

        {/* Pink Nose & Mouth */}
        <polygon points="31,28.5 33,28.5 32,30" fill="#EC4899" />
        <path
          d="M30 31C31 32 32 32 32 31C32 32 33 32 34 31"
          stroke="#27272A"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Whiskers */}
        <line
          x1="17"
          y1="29"
          x2="11"
          y2="28"
          stroke="#A1A1AA"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="17"
          y1="31"
          x2="12"
          y2="32"
          stroke="#A1A1AA"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="47"
          y1="29"
          x2="53"
          y2="28"
          stroke="#A1A1AA"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="47"
          y1="31"
          x2="52"
          y2="32"
          stroke="#A1A1AA"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Feet */}
      <ellipse cx="25" cy="52" rx="4" ry="2.5" fill="#F4F4F5" stroke="#E4E4E7" strokeWidth="1" />
      <ellipse cx="39" cy="52" rx="4" ry="2.5" fill="#F4F4F5" stroke="#E4E4E7" strokeWidth="1" />
    </svg>
  );
});
