// Web Audio API harmonic chime generator (0kb assets, instant, reliable, zero lag)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

/**
 * Proactively unlock Web AudioContext upon user gesture
 */
export function unlockAudioContext(): void {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
  } catch (err) {
    console.warn('Unable to unlock AudioContext:', err);
  }
}

/**
 * Automatically attaches one-time user interaction listeners to unlock Web AudioContext
 */
export function initAudioUnlockListener(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleUnlock = () => {
    unlockAudioContext();
    window.removeEventListener('pointerdown', handleUnlock);
    window.removeEventListener('keydown', handleUnlock);
    window.removeEventListener('click', handleUnlock);
  };

  window.addEventListener('pointerdown', handleUnlock, { passive: true });
  window.addEventListener('keydown', handleUnlock, { passive: true });
  window.addEventListener('click', handleUnlock, { passive: true });

  return () => {
    window.removeEventListener('pointerdown', handleUnlock);
    window.removeEventListener('keydown', handleUnlock);
    window.removeEventListener('click', handleUnlock);
  };
}

/**
 * Plays a modern, pleasant 3-tone harmonic chime (D5 -> A5 -> D6)
 * to clearly signal timer completion or audio preview
 */
export async function playTimerChime(): Promise<void> {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;

    // Note 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.32, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.65);

    // Note 2: A5 (880.00 Hz) - delayed harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.15);
    gain2.gain.setValueAtTime(0.001, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.28, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.9);

    // Note 3: D6 (1174.66 Hz) - crisp sparkle finish
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1174.66, now + 0.3);
    gain3.gain.setValueAtTime(0.001, now + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.22, now + 0.33);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.3);
    osc3.stop(now + 1.25);
  } catch (err) {
    console.warn('Unable to play audio chime:', err);
  }
}
