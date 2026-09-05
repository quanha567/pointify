import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { RoundTimerProjection } from '../types/room.types';
import { playTimerChime, unlockAudioContext } from '../utils/web-audio-chime';

const STORAGE_MUTE_KEY = 'pointify_timer_muted';
const MUTE_CHANGE_EVENT = 'pointify_mute_changed';

export type TimerColorPhase = 'brand' | 'warning' | 'urgent' | 'expired';

export interface UseRoundTimerResult {
  isActive: boolean;
  status: 'idle' | 'running' | 'paused' | 'expired';
  remainingSeconds: number;
  formattedTime: string;
  durationSeconds: number;
  progressPercentage: number;
  colorPhase: TimerColorPhase;
  gaugeColor: string;
  isMuted: boolean;
  toggleMute: () => void;
}

export function useRoundTimer(
  timer: RoundTimerProjection | null | undefined,
  isRevealed = false,
): UseRoundTimerResult {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_MUTE_KEY) === 'true';
  });

  // Keep all instances of useRoundTimer in sync across components
  useEffect(() => {
    const handleMuteChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setIsMuted(customEvent.detail);
      }
    };
    window.addEventListener(MUTE_CHANGE_EVENT, handleMuteChange);
    return () => {
      window.removeEventListener(MUTE_CHANGE_EVENT, handleMuteChange);
    };
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_MUTE_KEY, String(next));
        window.dispatchEvent(new CustomEvent(MUTE_CHANGE_EVENT, { detail: next }));
      }
      if (!next) {
        unlockAudioContext();
      }
      return next;
    });
  }, []);

  const [now, setNow] = useState(() => Date.now());
  const hasPlayedChimeRef = useRef(false);
  const previousTimerEndsAtRef = useRef<number | null>(null);

  // Reset chime trigger when endsAt changes (e.g. +30s or restart)
  useEffect(() => {
    if (timer?.endsAt !== previousTimerEndsAtRef.current) {
      hasPlayedChimeRef.current = false;
      previousTimerEndsAtRef.current = timer?.endsAt ?? null;
    }
  }, [timer?.endsAt]);

  // Active ticker loop
  useEffect(() => {
    if (!timer || timer.status !== 'running' || isRevealed) {
      return;
    }

    setNow(Date.now());
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current > timer.endsAt + 4500) {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [timer?.status, timer?.endsAt, isRevealed]);

  // Reliable chime trigger when timer reaches 0 (effect-based, outside render)
  const isExpired = Boolean(
    timer && timer.status === 'running' && !isRevealed && timer.endsAt - now <= 0,
  );

  useEffect(() => {
    if (isExpired && !hasPlayedChimeRef.current) {
      hasPlayedChimeRef.current = true;
      if (!isMuted) {
        void playTimerChime();
      }
    }
  }, [isExpired, isMuted]);

  // Derived calculations (pure, no side-effects)
  return useMemo(() => {
    if (!timer || isRevealed) {
      return {
        isActive: false,
        status: 'idle',
        remainingSeconds: 0,
        formattedTime: '00:00',
        durationSeconds: 0,
        progressPercentage: 0,
        colorPhase: 'brand',
        gaugeColor: '#d40d65',
        isMuted,
        toggleMute,
      };
    }

    const duration = timer.durationSeconds || 120;
    let remaining = 0;
    let status: 'running' | 'paused' | 'expired' = 'running';

    if (timer.status === 'paused') {
      remaining = Math.max(0, timer.remainingSecondsOnPause ?? 0);
      status = remaining === 0 ? 'expired' : 'paused';
    } else {
      const diffMs = timer.endsAt - now;
      if (diffMs < -4000) {
        return {
          isActive: false,
          status: 'idle',
          remainingSeconds: 0,
          formattedTime: '00:00',
          durationSeconds: 0,
          progressPercentage: 0,
          colorPhase: 'brand',
          gaugeColor: '#d40d65',
          isMuted,
          toggleMute,
        };
      }
      remaining = Math.max(0, Math.ceil(diffMs / 1000));
      status = remaining === 0 ? 'expired' : 'running';
    }

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const progressPercentage = Math.min(100, Math.max(0, (remaining / duration) * 100));

    let colorPhase: TimerColorPhase = 'brand';
    let gaugeColor = '#d40d65'; // Brand Pink

    if (status === 'expired') {
      colorPhase = 'expired';
      gaugeColor = '#ef4444'; // Red
    } else if (remaining <= 10 || remaining / duration < 0.2) {
      colorPhase = 'urgent';
      gaugeColor = '#ef4444'; // Red
    } else if (remaining / duration <= 0.5) {
      colorPhase = 'warning';
      gaugeColor = '#f59e0b'; // Amber
    }

    return {
      isActive: true,
      status,
      remainingSeconds: remaining,
      formattedTime,
      durationSeconds: duration,
      progressPercentage,
      colorPhase,
      gaugeColor,
      isMuted,
      toggleMute,
    };
  }, [timer, isRevealed, now, isMuted, toggleMute]);
}
