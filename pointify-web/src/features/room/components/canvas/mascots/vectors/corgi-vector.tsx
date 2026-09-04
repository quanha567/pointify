import { memo } from 'react';
import { motion } from 'motion/react';

interface VectorProps {
  isOffline?: boolean;
}

export const CorgiVector = memo(function CorgiVector({ isOffline }: VectorProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Corgi Body */}
      <motion.ellipse
        cx="32"
        cy="43"
        rx="17"
        ry="14"
        fill="#EA580C"
        animate={isOffline ? {} : { ry: [14, 14.7, 14] }}
        transition={{ repeat: Infinity, duration: 2.1, ease: 'easeInOut' }}
      />
      {/* White Chest */}
      <path d="M26 38C26 38 32 40 38 38C38 46 36 52 32 52C28 52 26 46 26 38Z" fill="#FFFFFF" />

      {/* Head Group */}
      <motion.g
        animate={isOffline ? { y: 2, rotate: -4 } : { rotate: [2, -3, 2], y: [0, -1, 0] }}
        style={{ transformOrigin: '32px 32px' }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
      >
        {/* Big Corgi Ears */}
        <motion.path
          d="M17 25C13 14 17 6 22 10C27 14 26 23 26 25Z"
          fill="#EA580C"
          animate={isOffline ? {} : { rotate: [0, -4, 0] }}
          style={{ transformOrigin: '22px 22px' }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        />
        <path d="M18 21C15 14 18 9 21 12C24 15 24 20 24 21Z" fill="#FCA5A5" />

        <motion.path
          d="M47 25C51 14 47 6 42 10C37 14 38 23 38 25Z"
          fill="#EA580C"
          animate={isOffline ? {} : { rotate: [0, 4, 0] }}
          style={{ transformOrigin: '42px 22px' }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        />
        <path d="M46 21C49 14 46 9 43 12C40 15 40 20 40 21Z" fill="#FCA5A5" />

        {/* Head Base */}
        <ellipse cx="32" cy="28" rx="15" ry="12" fill="#EA580C" />

        {/* White blaze in the middle of forehead down to muzzle */}
        <path
          d="M30 18C30 18 34 18 34 18C33 24 36 28 36 32C36 36 28 36 28 32C28 28 31 24 30 18Z"
          fill="#FFFFFF"
        />

        {/* Cheeks */}
        <ellipse cx="21" cy="31" rx="2.5" ry="1.5" fill="#FCA5A5" opacity="0.6" />
        <ellipse cx="43" cy="31" rx="2.5" ry="1.5" fill="#FCA5A5" opacity="0.6" />

        {/* Eyes */}
        {isOffline ? (
          <>
            <path
              d="M22 27C23.5 25.5 26 25.5 27.5 27"
              stroke="#431407"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M36.5 27C38 25.5 40.5 25.5 42 27"
              stroke="#431407"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <motion.ellipse
              cx="24"
              cy="27"
              rx="2.2"
              ry="2.6"
              fill="#431407"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.88, 0.94, 1] }}
            />
            <circle cx="25" cy="26" r="0.8" fill="white" />

            <motion.ellipse
              cx="40"
              cy="27"
              rx="2.2"
              ry="2.6"
              fill="#431407"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.88, 0.94, 1] }}
            />
            <circle cx="41" cy="26" r="0.8" fill="white" />
          </>
        )}

        {/* Dog Nose */}
        <ellipse cx="32" cy="31" rx="2" ry="1.5" fill="#1C1917" />
        {/* Mouth with slight tongue */}
        <path
          d="M30 33C31 34 33 34 34 33"
          stroke="#431407"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <motion.path
          d="M31 33.5C31 35.5 33 35.5 33 33.5"
          fill="#F43F5E"
          animate={isOffline ? {} : { scaleY: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      </motion.g>

      {/* Paws */}
      <ellipse cx="25" cy="52" rx="4" ry="2.5" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1" />
      <ellipse cx="39" cy="52" rx="4" ry="2.5" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1" />
    </svg>
  );
});
