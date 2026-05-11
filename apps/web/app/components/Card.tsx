import { motion } from 'motion/react';
import clsx from 'clsx';
import type { Card as CardT } from '@flip7/shared';

interface Props {
  card?: CardT | null;
  faceDown?: boolean;
  small?: boolean;
  highlight?: boolean;
}

const numberColor = (v: number) => {
  // Map number → hue, more saturated for higher
  const hues = [220, 200, 180, 160, 140, 90, 50, 30, 20, 10, 350, 320, 280];
  const h = hues[v] ?? 200;
  return `oklch(0.55 0.18 ${h})`;
};

export function Card({ card, faceDown, small, highlight }: Props) {
  const w = small ? 'w-12 h-16 text-base' : 'w-20 h-28 text-3xl';

  if (faceDown || !card) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -8, rotateY: 90 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        className={clsx(
          w,
          'rounded-xl bg-linear-to-br from-accent to-primary border border-white/10 shadow-card flex items-center justify-center text-white font-black select-none',
        )}
      >
        7
      </motion.div>
    );
  }

  const base = clsx(
    w,
    'rounded-xl border shadow-card flex flex-col items-center justify-center font-black select-none',
    highlight && 'ring-2 ring-gold',
  );

  if (card.kind === 'number') {
    return (
      <motion.div
        layout
        initial={{ rotateY: 180, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className={clsx(base, 'text-white border-white/15')}
        style={{ background: numberColor(card.value) }}
      >
        <span>{card.value}</span>
      </motion.div>
    );
  }

  if (card.kind === 'modifier') {
    return (
      <motion.div
        layout
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={clsx(base, 'bg-gold text-bg border-yellow-300/60')}
      >
        <span className={small ? 'text-sm' : 'text-2xl'}>{card.modifier}</span>
      </motion.div>
    );
  }

  // action
  const label =
    card.action === 'freeze' ? '❄️' : card.action === 'flip3' ? '🔁' : '🛟';
  const sub =
    card.action === 'freeze'
      ? 'Freeze'
      : card.action === 'flip3'
        ? 'Flip 3'
        : '2nd Chance';
  return (
    <motion.div
      layout
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={clsx(base, 'bg-accent text-white border-white/15')}
    >
      <span>{label}</span>
      {!small && <span className="text-[10px] mt-1 opacity-90">{sub}</span>}
    </motion.div>
  );
}
