import { memo } from 'react';
import { motion } from 'motion/react';

interface VectorProps {
  isOffline?: boolean;
}

export const PenguinVector = memo(function PenguinVector({ isOffline }: VectorProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black Outer Body */}
      <motion.ellipse
        cx="32"
        cy="38"
        rx="18"
        ry="20"
        fill="#1E293B"
        animate={isOffline ? {} : { rotate: [-2, 2, -2], y: [0, -1, 0] }}
        style={{ transformOrigin: '32px 52px' }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      />

      {/* Left Flipper */}
      <motion.ellipse
        cx="14"
        cy="38"
        rx="3.5"
        ry="9"
        fill="#0F172A"
        animate={isOffline ? {} : { rotate: [0, -10, 0] }}
        style={{ transformOrigin: '14px 30px' }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
      />

      {/* Right Flipper */}
      <motion.ellipse
        cx="50"
        cy="38"
        rx="3.5"
        ry="9"
        fill="#0F172A"
        animate={isOffline ? {} : { rotate: [0, 10, 0] }}
        style={{ transformOrigin: '50px 30px' }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
      />

      {/* White Belly */}
      <ellipse cx="32" cy="40" rx="13" ry="15" fill="#FFFFFF" />

      {/* Cheeks */}
      <ellipse cx="23" cy="33" rx="2" ry="1.2" fill="#FDA4AF" opacity="0.6" />
      <ellipse cx="41" cy="33" rx="2" ry="1.2" fill="#FDA4AF" opacity="0.6" />

      {/* Eyes */}
      {isOffline ? (
        <>
          <path
            d="M22 28C23.5 27 25.5 27 27 28"
            stroke="#0F172A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M37 28C38.5 27 40.5 27 42 28"
            stroke="#0F172A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <motion.ellipse
            cx="25"
            cy="27"
            rx="2.2"
            ry="2.6"
            fill="#0F172A"
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ repeat: Infinity, duration: 3.8, times: [0, 0.88, 0.94, 1] }}
          />
          <circle cx="26" cy="26" r="0.8" fill="white" />

          <motion.ellipse
            cx="39"
            cy="27"
            rx="2.2"
            ry="2.6"
            fill="#0F172A"
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ repeat: Infinity, duration: 3.8, times: [0, 0.88, 0.94, 1] }}
          />
          <circle cx="40" cy="26" r="0.8" fill="white" />
        </>
      )}

      {/* Orange Beak */}
      <polygon points="32,36 28,30 36,30" fill="#F59E0B" />

      {/* Feet */}
      <ellipse cx="25" cy="55" rx="5" ry="2.5" fill="#F59E0B" />
      <ellipse cx="39" cy="55" rx="5" ry="2.5" fill="#F59E0B" />
    </svg>
  );
});
