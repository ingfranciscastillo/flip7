import { useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useFeedbackStore } from '../store/feedbackStore';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  colors?: string[];
}

const SUBTLE_COLORS = ['#e11d48', '#fbbf24', '#2563eb', '#22c55e', '#ffffff'];

function matchesMedia(): boolean {
  if (typeof window === 'undefined') return true;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useConfetti() {
  const lastTriggerRef = useRef<number>(0);

  const burst = useCallback((options: ConfettiOptions = {}) => {
    if (!matchesMedia()) return;

    const now = Date.now();
    if (now - lastTriggerRef.current < 500) return;
    lastTriggerRef.current = now;

    const { particleCount = 30, spread = 50, colors = SUBTLE_COLORS } = options;

    confetti({
      particleCount,
      spread,
      colors,
      origin: { x: 0.5, y: 0.6 },
      ticks: 100,
      gravity: 0.8,
      decay: 0.95,
      startVelocity: 25,
    });
  }, []);

  const flip7Celebrate = useCallback(() => {
    if (!matchesMedia()) return;

    const defaults = {
      spread: 360,
      ticks: 150,
      gravity: 0.7,
      decay: 0.94,
      startVelocity: 25,
      colors: ['#fbbf24', '#f59e0b', '#ffffff'],
    };

    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1,
      origin: { x: 0.5, y: 0.5 },
    });

    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 20,
        scalar: 0.75,
        origin: { x: 0.5, y: 0.5 },
      });
    }, 200);
  }, []);

  const gameEndCelebrate = useCallback(() => {
    if (!matchesMedia()) return;

    const defaults = {
      spread: 360,
      ticks: 200,
      gravity: 0.6,
      decay: 0.95,
      startVelocity: 30,
      colors: ['#e11d48', '#fbbf24', '#22c55e', '#ffffff'],
    };

    const duration = 2000;
    const end = Date.now() + duration;
    const interval = setInterval(() => {
      confetti({
        ...defaults,
        particleCount: 25,
        scalar: 1.2,
        origin: { x: 0.5, y: 0.5 },
      });
    }, 250);

    setTimeout(() => clearInterval(interval), duration);
  }, []);

  const gameStartCelebrate = useCallback(() => {
    if (!matchesMedia()) return;

    confetti({
      particleCount: 50,
      spread: 80,
      colors: ['#e11d48', '#2563eb', '#ffffff'],
      origin: { x: 0.5, y: 0.8 },
      ticks: 150,
      gravity: 0.9,
      decay: 0.95,
      startVelocity: 30,
    });
  }, []);

  const roundEndCelebrate = useCallback(() => {
    if (!matchesMedia()) return;

    confetti({
      particleCount: 35,
      spread: 60,
      colors: ['#2563eb', '#22c55e', '#ffffff'],
      origin: { x: 0.5, y: 0.7 },
      ticks: 120,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 20,
    });
  }, []);

  return {
    burst,
    flip7Celebrate,
    gameEndCelebrate,
    gameStartCelebrate,
    roundEndCelebrate,
  };
}

export function ConfettiCelebration() {
  const events = useFeedbackStore((s) => s.events);
  const confetti = useConfetti();
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const latestEvent = events[events.length - 1];
    if (!latestEvent || processedRef.current.has(latestEvent.id)) return;

    processedRef.current.add(latestEvent.id);

    if (processedRef.current.size > 50) {
      const toDelete = Array.from(processedRef.current).slice(0, -50);
      toDelete.forEach((id) => processedRef.current.delete(id));
    }

    switch (latestEvent.type) {
      case 'flip7':
        confetti.flip7Celebrate();
        break;
      case 'game_end':
        confetti.gameEndCelebrate();
        break;
      case 'game_start':
        confetti.gameStartCelebrate();
        break;
      case 'round_end':
        confetti.roundEndCelebrate();
        break;
    }
  }, [events, confetti]);

  return null;
}
