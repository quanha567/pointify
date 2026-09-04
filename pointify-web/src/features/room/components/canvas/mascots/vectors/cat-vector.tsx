import { memo } from 'react';
import { motion } from 'motion/react';

interface VectorProps {
  isOffline?: boolean;
}

export const CatVector = memo(function CatVector({ isOffline }: VectorProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <motion.ellipse
        cx="32"
        cy="42"
        rx="18"
        ry="15"
        fill="#F59E0B"
        animate={isOffline ? {} : { ry: [15, 15.6, 15] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      />
      {/* Belly */}
      <ellipse cx="32" cy="45" rx="11" ry="9" fill="#FEF3C7" />

      {/* Tail waving */}
      <motion.path
        d="M48 44C54 44 57 38 56 32C55 30 52 30 52 33C52 38 48 40 45 42"
        stroke="#D97706"
        strokeWidth="3.5"
        strokeLinecap="round"
        animate={isOffline ? {} : { rotate: [0, 8, -4, 0] }}
        style={{ transformOrigin: '48px 44px' }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      />

      {/* Head + Ears Group: Inquisitive head tilt when thinking */}
      <motion.g
        animate={isOffline ? { y: 2, rotate: 6 } : { rotate: [-6, 6, -6], y: [0, -1.5, 0] }}
        style={{ transformOrigin: '32px 36px' }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
      >
        {/* Left Ear */}
        <motion.path
          d="M20 23L16 12L27 18Z"
          fill="#F59E0B"
          animate={isOffline ? {} : { rotate: [0, -5, 0] }}
          style={{ transformOrigin: '20px 20px' }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        />
        <path d="M19 21L17 14L25 18Z" fill="#FCA5A5" />

        {/* Right Ear */}
        <motion.path
          d="M44 23L48 12L37 18Z"
          fill="#F59E0B"
          animate={isOffline ? {} : { rotate: [0, 5, 0] }}
          style={{ transformOrigin: '44px 20px' }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        />
        <path d="M45 21L47 14L39 18Z" fill="#FCA5A5" />

        {/* Head Base */}
        <ellipse cx="32" cy="27" rx="15" ry="12.5" fill="#F59E0B" />

        {/* Cheeks */}
        <ellipse cx="23" cy="30" rx="2.5" ry="1.5" fill="#FCA5A5" opacity="0.7" />
        <ellipse cx="41" cy="30" rx="2.5" ry="1.5" fill="#FCA5A5" opacity="0.7" />

        {/* Eyes */}
        {isOffline ? (
          /* Sleeping closed eyes ^ ^ */
          <>
            <path
              d="M22 26C23.5 24 26 24 27.5 26"
              stroke="#78350F"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M36.5 26C38 24 40.5 24 42 26"
              stroke="#78350F"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        ) : (
          /* Cute big thinking eyes */
          <>
            <motion.ellipse
              cx="25"
              cy="25"
              rx="2.2"
              ry="2.6"
              fill="#78350F"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.9, 0.95, 1] }}
            />
            <circle cx="26" cy="24" r="0.8" fill="white" />

            <motion.ellipse
              cx="39"
              cy="25"
              rx="2.2"
              ry="2.6"
              fill="#78350F"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.9, 0.95, 1] }}
            />
            <circle cx="40" cy="24" r="0.8" fill="white" />
          </>
        )}

        {/* Cute nose and mouth */}
        <polygon points="31,28 33,28 32,29.5" fill="#78350F" />
        <path
          d="M30 30.5C31 31.5 32 31.5 32 30C32 31.5 33 31.5 34 30.5"
          stroke="#78350F"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Whiskers */}
        <line
          x1="17"
          y1="28"
          x2="12"
          y2="27"
          stroke="#D97706"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="17"
          y1="30"
          x2="13"
          y2="31"
          stroke="#D97706"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="47"
          y1="28"
          x2="52"
          y2="27"
          stroke="#D97706"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="47"
          y1="30"
          x2="51"
          y2="31"
          stroke="#D97706"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Paws */}
      <ellipse cx="26" cy="52" rx="4" ry="2.5" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
      <ellipse cx="38" cy="52" rx="4" ry="2.5" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
    </svg>
  );
});
