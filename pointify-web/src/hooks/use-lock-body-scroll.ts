import { useEffect } from 'react';

/**
 * Custom hook to lock body scrolling when a modal/dialog/drawer is active.
 * Restores original body overflow style on cleanup or when unlocked.
 */
export function useLockBodyScroll(locked = true) {
  useEffect(() => {
    if (!locked) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [locked]);
}
