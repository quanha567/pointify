import * as React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { interpolate } from 'flubber';

// ─── Precision SVG Vector Paths (Normalized to 0 0 100 100) ────────────────

const PATHS = {
  // 1. Scrum Playing Card with rounded corners
  CARD: 'M 24,10 H 76 C 83,10 88,15 88,22 V 78 C 88,85 83,90 76,90 H 24 C 17,90 12,85 12,78 V 22 C 12,15 17,10 24,10 Z',
  // 2. Agile Story Point Shield / Badge
  SHIELD: 'M 50,8 L 86,20 C 86,56 70,80 50,92 C 30,80 14,56 14,20 Z',
  // 3. Discussion Bubble with tail
  BUBBLE:
    'M 22,14 H 78 C 85,14 90,19 90,26 V 62 C 90,69 85,74 78,74 H 50 L 30,88 V 74 H 22 C 15,74 10,69 10,62 V 26 C 10,19 15,14 22,14 Z',
  // 4. Sprint Consensus 5-Point Star
  STAR: 'M 50,8 L 62,34 L 88,38 L 68,57 L 74,84 L 50,70 L 26,84 L 32,57 L 12,38 L 38,34 Z',
  // 5. Tech Hexagon
  HEXAGON: 'M 50,10 L 86,30 L 86,70 L 50,90 L 14,70 L 14,30 Z',
  // 6. Poker Gem / Diamond
  DIAMOND: 'M 50,8 L 90,50 L 50,92 L 10,50 Z',
  // 7. Smooth Organic Squircle
  SQUIRCLE: 'M 50,8 C 82,8 92,18 92,50 C 92,82 82,92 50,92 C 18,92 8,82 8,50 C 8,18 18,8 50,8 Z',
};

// ─── Shape Definition & Thematic Configs ────────────────────────────────────

interface ShapeItem {
  id: string;
  size: number;
  sequence: string[];
  gradientId: string;
  gradientColors: {
    start: string;
    mid: string;
    end: string;
    glow: string;
    stroke: string;
  };
  position: { top?: string; bottom?: string; left?: string; right?: string };
  drift: { x: number[]; y: number[]; rotate: number[] };
  duration: number;
  dwellTime: number; // Time waiting between morphs (ms)
  morphTime: number; // Time taking to morph (s)
  initialDelay: number;
}

const SHAPE_CONFIGS: ShapeItem[] = [
  {
    id: 'shape-alpha',
    size: 150,
    sequence: [PATHS.CARD, PATHS.SHIELD, PATHS.STAR, PATHS.SQUIRCLE, PATHS.HEXAGON],
    gradientId: 'grad-alpha',
    gradientColors: {
      start: 'rgba(99, 102, 241, 0.45)', // Indigo
      mid: 'rgba(139, 92, 246, 0.35)', // Violet
      end: 'rgba(168, 85, 247, 0.22)', // Purple
      glow: 'rgba(99, 102, 241, 0.55)',
      stroke: 'rgba(165, 180, 252, 0.75)',
    },
    position: { top: '10%', left: '7%' },
    drift: {
      x: [0, 30, -25, 0],
      y: [0, -28, 20, 0],
      rotate: [0, 18, -12, 0],
    },
    duration: 22,
    dwellTime: 2200,
    morphTime: 2.0,
    initialDelay: 300,
  },
  {
    id: 'shape-beta',
    size: 135,
    sequence: [PATHS.BUBBLE, PATHS.STAR, PATHS.CARD, PATHS.DIAMOND, PATHS.SHIELD],
    gradientId: 'grad-beta',
    gradientColors: {
      start: 'rgba(236, 72, 153, 0.45)', // Pink
      mid: 'rgba(244, 63, 94, 0.35)', // Rose
      end: 'rgba(251, 113, 133, 0.22)', // Rose light
      glow: 'rgba(244, 63, 94, 0.5)',
      stroke: 'rgba(254, 205, 211, 0.8)',
    },
    position: { top: '44%', right: '6%' },
    drift: {
      x: [0, -32, 22, 0],
      y: [0, 24, -28, 0],
      rotate: [0, -22, 16, 0],
    },
    duration: 26,
    dwellTime: 2500,
    morphTime: 2.2,
    initialDelay: 1200,
  },
  {
    id: 'shape-gamma',
    size: 120,
    sequence: [PATHS.STAR, PATHS.HEXAGON, PATHS.BUBBLE, PATHS.CARD, PATHS.SQUIRCLE],
    gradientId: 'grad-gamma',
    gradientColors: {
      start: 'rgba(14, 165, 233, 0.45)', // Sky
      mid: 'rgba(59, 130, 246, 0.35)', // Blue
      end: 'rgba(99, 102, 241, 0.22)', // Indigo
      glow: 'rgba(56, 189, 248, 0.55)',
      stroke: 'rgba(186, 230, 253, 0.8)',
    },
    position: { top: '18%', right: '15%' },
    drift: {
      x: [0, 22, -26, 0],
      y: [0, -30, 18, 0],
      rotate: [0, 25, -30, 0],
    },
    duration: 20,
    dwellTime: 2000,
    morphTime: 1.9,
    initialDelay: 800,
  },
  {
    id: 'shape-delta',
    size: 125,
    sequence: [PATHS.SHIELD, PATHS.DIAMOND, PATHS.CARD, PATHS.STAR, PATHS.BUBBLE],
    gradientId: 'grad-delta',
    gradientColors: {
      start: 'rgba(249, 115, 22, 0.42)', // Orange
      mid: 'rgba(244, 63, 94, 0.32)', // Rose
      end: 'rgba(234, 179, 8, 0.2)', // Amber
      glow: 'rgba(249, 115, 22, 0.5)',
      stroke: 'rgba(254, 215, 170, 0.8)',
    },
    position: { bottom: '12%', left: '12%' },
    drift: {
      x: [0, -22, 30, 0],
      y: [0, 26, -20, 0],
      rotate: [0, 30, -18, 0],
    },
    duration: 19,
    dwellTime: 2400,
    morphTime: 2.1,
    initialDelay: 1800,
  },
  {
    id: 'shape-epsilon',
    size: 105,
    sequence: [PATHS.HEXAGON, PATHS.SQUIRCLE, PATHS.CARD, PATHS.SHIELD, PATHS.STAR],
    gradientId: 'grad-epsilon',
    gradientColors: {
      start: 'rgba(16, 185, 129, 0.42)', // Emerald
      mid: 'rgba(20, 184, 166, 0.32)', // Teal
      end: 'rgba(6, 182, 212, 0.2)', // Cyan
      glow: 'rgba(52, 211, 153, 0.5)',
      stroke: 'rgba(167, 243, 208, 0.8)',
    },
    position: { top: '75%', left: '44%' },
    drift: {
      x: [0, 25, -15, 0],
      y: [0, -18, 25, 0],
      rotate: [0, -28, 35, 0],
    },
    duration: 17,
    dwellTime: 1900,
    morphTime: 1.8,
    initialDelay: 2200,
  },
];

// ─── Individual Clean Morphing Entity Component ────────────────────────────

function CleanMorphingShape({ shape }: { shape: ShapeItem }) {
  const [index, setIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMorphing, setIsMorphing] = React.useState(false);

  const progress = useMotionValue(0);
  const nextIndex = (index + 1) % shape.sequence.length;

  const currentPath = shape.sequence[index];
  const nextPath = shape.sequence[nextIndex];

  // Flubber interpolation function between current path and next path
  const interpolator = React.useMemo(() => {
    return interpolate(currentPath, nextPath, {
      maxSegmentLength: 1.0,
      string: true,
    });
  }, [currentPath, nextPath]);

  // Framer Motion transforms the progress 0 -> 1 to SVG path string, strictly clamped
  const pathD = useTransform(progress, (latest) => {
    const clamped = Math.max(0, Math.min(1, latest));
    return interpolator(clamped);
  });

  // Trigger continuous smooth morph transition
  const triggerMorph = React.useCallback(() => {
    setIsMorphing(true);
    progress.set(0);

    const duration = isHovered ? 1.0 : shape.morphTime;

    animate(progress, 1, {
      duration,
      ease: [0.4, 0.0, 0.2, 1.0], // Natural fluid easing
      onComplete: () => {
        setIndex((prev) => (prev + 1) % shape.sequence.length);
        progress.set(0);
        setIsMorphing(false);
      },
    });
  }, [progress, isHovered, shape.morphTime, shape.sequence.length]);

  // Continuous auto-morph loop with natural dwell time
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    const initialTimer = setTimeout(() => {
      triggerMorph();

      const runLoop = () => {
        timer = setTimeout(
          () => {
            triggerMorph();
            runLoop();
          },
          shape.dwellTime + shape.morphTime * 1000,
        );
      };

      runLoop();
    }, shape.initialDelay);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(timer);
    };
  }, [triggerMorph, shape.dwellTime, shape.morphTime, shape.initialDelay]);

  // Immediate morph on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!isMorphing) {
      triggerMorph();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.div
      className="absolute pointer-events-auto cursor-pointer select-none group"
      style={{
        width: shape.size,
        height: shape.size,
        ...shape.position,
      }}
      animate={{
        x: shape.drift.x,
        y: shape.drift.y,
        rotate: shape.drift.rotate,
      }}
      transition={{
        duration: shape.duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{
        scale: 1.25,
        transition: { type: 'spring', stiffness: 300, damping: 18 },
      }}
      whileTap={{ scale: 0.92 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Ambient Glass Halo Glow */}
      <motion.div
        className="absolute inset-0 rounded-full filter blur-[28px] opacity-70 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${shape.gradientColors.glow} 0%, transparent 70%)`,
        }}
        animate={{
          scale: isMorphing ? [1, 1.2, 1] : [1, 1.08, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 2. Glassmorphic Vector Morphing SVG */}
      <svg
        viewBox="0 0 100 100"
        className="relative size-full overflow-visible transition-all duration-300"
        style={{
          filter: isHovered
            ? `drop-shadow(0 12px 24px ${shape.gradientColors.glow}) drop-shadow(0 0 16px ${shape.gradientColors.stroke})`
            : `drop-shadow(0 8px 18px ${shape.gradientColors.glow}) drop-shadow(0 2px 6px rgba(0,0,0,0.08))`,
        }}
      >
        <defs>
          {/* Main Lush Mesh Gradient */}
          <linearGradient id={shape.gradientId} x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor={shape.gradientColors.start} />
            <stop offset="50%" stopColor={shape.gradientColors.mid} />
            <stop offset="100%" stopColor={shape.gradientColors.end} />
          </linearGradient>

          {/* Glowing Stroke Gradient */}
          <linearGradient id={`${shape.gradientId}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
            <stop offset="50%" stopColor={shape.gradientColors.stroke} />
            <stop offset="100%" stopColor={shape.gradientColors.start} stopOpacity={0.4} />
          </linearGradient>

          {/* Specular Highlight Gradient */}
          <linearGradient id={`${shape.gradientId}-specular`} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Outer Morphing Silhouette Fill */}
        <motion.path d={pathD} fill={`url(#${shape.gradientId})`} className="backdrop-blur-md" />

        {/* Specular Top Shine Layer */}
        <motion.path
          d={pathD}
          fill={`url(#${shape.gradientId}-specular)`}
          className="mix-blend-overlay"
        />

        {/* Luminous Precision Stroke */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={`url(#${shape.gradientId}-stroke)`}
          strokeWidth={isHovered ? 2.5 : 1.8}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

// ─── Main Floating Shapes Container ────────────────────────────────────────

export function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden>
      {/* Large Ambient Fluid Blob — Top Left */}
      <motion.div
        className="absolute -top-40 -left-40 size-[620px] rounded-full bg-gradient-to-br from-primary/25 via-indigo-500/18 to-transparent blur-[95px]"
        animate={{
          x: [0, 40, -25, 0],
          y: [0, -30, 25, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      />

      {/* Large Ambient Fluid Blob — Bottom Right */}
      <motion.div
        className="absolute -bottom-40 -right-40 size-[580px] rounded-full bg-gradient-to-tl from-violet-500/22 via-rose-500/15 to-transparent blur-[95px]"
        animate={{
          x: [0, -32, 28, 0],
          y: [0, 25, -35, 0],
          scale: [1, 0.92, 1.08, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />

      {/* Center Subtle Aurora Ray */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-gradient-to-r from-primary/10 via-violet-500/10 to-transparent blur-[110px] pointer-events-none"
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Dynamic Clean Vector Morphing Glass Entities */}
      {SHAPE_CONFIGS.map((shape) => (
        <CleanMorphingShape key={shape.id} shape={shape} />
      ))}
    </div>
  );
}
