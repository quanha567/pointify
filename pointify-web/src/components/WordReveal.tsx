import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface WordRevealProps {
  text: string;
  delay?: number;
  staggerDelay?: number;
  className?: string;
}

export function WordReveal({ text, delay = 0, staggerDelay = 0.06, className }: WordRevealProps) {
  const words = text.split(' ');

  return (
    <span className={cn('inline-flex flex-wrap justify-center gap-x-[0.3em]', className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: delay + i * staggerDelay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
