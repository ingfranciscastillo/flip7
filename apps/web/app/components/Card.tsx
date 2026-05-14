import { motion } from 'motion/react';
import clsx from 'clsx';
import type { Card as CardT } from '@flip7/shared';

type CardAnimation =
  | 'enter'
  | 'flip'
  | 'bounce'
  | 'shake'
  | 'glow'
  | 'frozen'
  | 'none';

interface Props {
  card?: CardT | null;
  faceDown?: boolean;
  small?: boolean;
  highlight?: boolean;
  animate?: CardAnimation;
  delay?: number;
  layoutId?: string;
}

const numberColor = (v: number) => {
  const hues = [220, 200, 180, 160, 140, 90, 50, 30, 20, 10, 350, 320, 280];
  const h = hues[v] ?? 200;
  return `oklch(0.55 0.18 ${h})`;
};

const modifierColor = (mod: string) => {
  if (mod === 'x2') return 'bg-gradient-to-br from-purple-500 to-pink-500';
  return 'bg-gradient-to-br from-yellow-400 to-amber-500';
};

const actionBg = (action: string) => {
  switch (action) {
    case 'freeze':
      return 'bg-gradient-to-br from-cyan-400 to-blue-500';
    case 'flip3':
      return 'bg-gradient-to-br from-orange-400 to-red-500';
    case 'second_chance':
      return 'bg-gradient-to-br from-green-400 to-emerald-500';
    default:
      return 'bg-gradient-to-br from-accent to-blue-600';
  }
};

const getBounceTextClass = (animate: CardAnimation) =>
  animate === 'bounce' ? 'feedback-pop' : '';

export function Card({
  card,
  faceDown,
  small,
  highlight,
  animate = 'none',
  delay = 0,
  layoutId,
}: Props) {
  const w = small ? 'w-12 h-16 text-base' : 'w-20 h-28 text-3xl';

  if (faceDown || !card) {
    const baseClass = clsx(
      w,
      'rounded-xl bg-primary border border-white/10 shadow-card flex items-center justify-center text-white font-black select-none',
      animate === 'shake' && 'feedback-shake',
      animate === 'glow' && 'feedback-glow',
    );
    const bounceClass = getBounceTextClass(animate);

    if (animate === 'enter') {
      return (
        <motion.div
          layout
          layoutId={layoutId}
          initial={{ opacity: 0, scale: 0.4, y: -150, x: 0, rotateX: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0, rotateX: 0 }}
          transition={{
            type: 'spring' as const,
            damping: 14,
            stiffness: 120,
            mass: 0.8,
            delay: delay * 0.1,
          }}
          className={baseClass}
        />
      );
    }

    if (animate === 'flip') {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, rotateY: 180 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.35, delay: delay * 0.1 }}
          className={baseClass}
        />
      );
    }

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -8, rotateY: 90 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        className={baseClass}
      />
    );
  }

  const base = clsx(
    w,
    'rounded-xl border shadow-card flex flex-col items-center justify-center font-black select-none',
    highlight && 'ring-2 ring-gold',
  );

  if (card.kind === 'number') {
    const baseClass = clsx(base, 'text-white border-white/15');
    const bounceClass = getBounceTextClass(animate);

    if (animate === 'enter') {
      return (
        <motion.div
          layout
          layoutId={layoutId}
          initial={{ opacity: 0, scale: 0.4, y: -150, x: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          transition={{
            type: 'spring' as const,
            damping: 14,
            stiffness: 120,
            mass: 0.8,
            delay: delay * 0.1,
          }}
          className={baseClass}
          style={{ background: numberColor(card.value) }}
        >
          <span className={bounceClass}>{card.value}</span>
        </motion.div>
      );
    }

    if (animate === 'flip') {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, rotateY: 180, scale: 0.8 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: delay * 0.1 }}
          className={baseClass}
          style={{ background: numberColor(card.value) }}
        >
          <span className={bounceClass}>{card.value}</span>
        </motion.div>
      );
    }

    if (animate === 'bounce') {
      return (
        <motion.div
          layout
          initial={{ scale: 0.5, y: -30 }}
          animate={{ scale: [1, 1.15, 0.95, 1.05, 1], y: 0 }}
          transition={{
            duration: 0.5,
            delay: delay * 0.1,
            times: [0, 0.3, 0.5, 0.7, 1],
          }}
          className={baseClass}
          style={{ background: numberColor(card.value) }}
        >
          <span className="feedback-pop">{card.value}</span>
        </motion.div>
      );
    }

    if (animate === 'shake') {
      return (
        <motion.div
          layout
          animate={{
            x: [0, -8, 8, -6, 6, -4, 4, 0],
            rotate: [-2, 2, -1, 1, 0],
          }}
          transition={{ duration: 0.5, delay: delay * 0.1 }}
          className={clsx(baseClass, 'feedback-shake')}
          style={{ background: numberColor(card.value) }}
        >
          {card.value}
        </motion.div>
      );
    }

    if (animate === 'glow') {
      return (
        <motion.div
          layout
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 0 0px rgba(251, 191, 36, 0)',
              '0 0 20px rgba(251, 191, 36, 0.8)',
              '0 0 40px rgba(251, 191, 36, 0.6)',
              '0 0 20px rgba(251, 191, 36, 0.4)',
            ],
          }}
          transition={{
            duration: 1.5,
            delay: delay * 0.1,
            times: [0, 0.3, 0.6, 1],
          }}
          className={clsx(baseClass, 'feedback-glow')}
          style={{ background: numberColor(card.value) }}
        >
          <span className="feedback-glow">{card.value}</span>
        </motion.div>
      );
    }

    return (
      <motion.div
        layout
        className={baseClass}
        style={{ background: numberColor(card.value) }}
      >
        {card.value}
      </motion.div>
    );
  }

  if (card.kind === 'modifier') {
    const baseClass = clsx(
      base,
      modifierColor(card.modifier),
      'text-white border-white/20',
    );
    const modifierLabel = small ? 'text-sm' : 'text-2xl font-black';
    const modifierSub = card.modifier === 'x2' ? 'DOBLE' : 'BONUS';
    const bounceClass = getBounceTextClass(animate);

    if (animate === 'enter') {
      return (
        <motion.div
          layout
          layoutId={layoutId}
          initial={{ opacity: 0, scale: 0.4, y: -150, x: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          transition={{
            type: 'spring' as const,
            damping: 14,
            stiffness: 120,
            mass: 0.8,
            delay: delay * 0.1,
          }}
          className={baseClass}
        >
          <span className={bounceClass}>{card.modifier}</span>
          {!small && (
            <span className="text-[8px] mt-0.5 opacity-80 font-normal">
              {modifierSub}
            </span>
          )}
        </motion.div>
      );
    }

    if (animate === 'bounce') {
      return (
        <motion.div
          layout
          initial={{ scale: 0.5, y: -30 }}
          animate={{ scale: [1, 1.15, 0.95, 1.05, 1], y: 0 }}
          transition={{
            duration: 0.5,
            delay: delay * 0.1,
            times: [0, 0.3, 0.5, 0.7, 1],
          }}
          className={baseClass}
        >
          <span className="feedback-pop">{card.modifier}</span>
          {!small && (
            <span className="text-[8px] mt-0.5 opacity-80 font-normal">
              {modifierSub}
            </span>
          )}
        </motion.div>
      );
    }

    if (animate === 'glow') {
      return (
        <motion.div
          layout
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 0 0px rgba(251, 191, 36, 0)',
              '0 0 30px rgba(251, 191, 36, 0.9)',
              '0 0 50px rgba(251, 191, 36, 0.7)',
              '0 0 30px rgba(251, 191, 36, 0.5)',
            ],
          }}
          transition={{
            duration: 1.5,
            delay: delay * 0.1,
            times: [0, 0.3, 0.6, 1],
          }}
          className={clsx(baseClass, 'feedback-glow')}
        >
          <span className="feedback-glow">{card.modifier}</span>
          {!small && (
            <span className="text-[8px] mt-0.5 opacity-80 font-normal">
              {modifierSub}
            </span>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div layout className={baseClass}>
        <span className={modifierLabel}>{card.modifier}</span>
        {!small && (
          <span className="text-[8px] mt-0.5 opacity-80 font-normal">
            {modifierSub}
          </span>
        )}
      </motion.div>
    );
  }

  const label =
    card.action === 'freeze' ? '❄️' : card.action === 'flip3' ? '🔁' : '🛟';
  const sub =
    card.action === 'freeze'
      ? 'Freeze'
      : card.action === 'flip3'
        ? 'Flip 3'
        : '2nd';
  const baseClass = clsx(
    base,
    actionBg(card.action),
    'text-white border-white/15',
  );
  const bounceClass = getBounceTextClass(animate);

  if (animate === 'enter') {
    return (
      <motion.div
        layout
        layoutId={layoutId}
        initial={{ opacity: 0, scale: 0.4, y: -150, x: 0 }}
        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
        transition={{
          type: 'spring' as const,
          damping: 14,
          stiffness: 120,
          mass: 0.8,
          delay: delay * 0.1,
        }}
        className={baseClass}
      >
        <span className="feedback-pop">{label}</span>
        {!small && <span className="text-[10px] mt-1 opacity-90">{sub}</span>}
      </motion.div>
    );
  }

  if (animate === 'glow') {
    return (
      <motion.div
        layout
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 0px rgba(251, 191, 36, 0)',
            '0 0 30px rgba(251, 191, 36, 0.8)',
            '0 0 50px rgba(251, 191, 36, 0.6)',
            '0 0 30px rgba(251, 191, 36, 0.4)',
          ],
        }}
        transition={{
          duration: 1.5,
          delay: delay * 0.1,
          times: [0, 0.3, 0.6, 1],
        }}
        className={clsx(baseClass, 'feedback-glow')}
      >
        <span className="feedback-glow">{label}</span>
        {!small && <span className="text-[10px] mt-1 opacity-90">{sub}</span>}
      </motion.div>
    );
  }

  if (animate === 'frozen') {
    return (
      <motion.div
        layout
        animate={{
          filter: [
            'hue-rotate(0deg)',
            'hue-rotate(180deg)',
            'hue-rotate(0deg)',
          ],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 1.2,
          delay: delay * 0.1,
          times: [0, 0.3, 0.6, 1],
        }}
        className={clsx(baseClass, 'feedback-freeze')}
      >
        <span>{label}</span>
        {!small && <span className="text-[10px] mt-1 opacity-90">{sub}</span>}
      </motion.div>
    );
  }

  return (
    <motion.div layout className={baseClass}>
      <span className={bounceClass}>{label}</span>
      {!small && <span className="text-[10px] mt-1 opacity-90">{sub}</span>}
    </motion.div>
  );
}
