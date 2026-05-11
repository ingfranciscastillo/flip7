import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import type { PlayerPublic } from '@flip7/shared';
import { Card } from './Card';

interface Props {
  player: PlayerPublic;
  isCurrentTurn: boolean;
  isMe: boolean;
  selectable?: boolean;
  onClick?: () => void;
}

const statusColor: Record<PlayerPublic['status'], string> = {
  active: 'bg-success/20 text-success',
  stayed: 'bg-muted/30 text-muted',
  busted: 'bg-danger/20 text-danger',
  frozen: 'bg-blue-400/20 text-blue-300',
  flip7: 'bg-gold/30 text-gold',
  disconnected: 'bg-muted/20 text-muted',
};

const statusLabel: Record<PlayerPublic['status'], string> = {
  active: 'En juego',
  stayed: 'Stay',
  busted: 'Bust',
  frozen: 'Frozen',
  flip7: 'FLIP 7!',
  disconnected: 'Offline',
};

export function PlayerSeat({
  player,
  isCurrentTurn,
  isMe,
  selectable,
  onClick,
}: Props) {
  return (
    <motion.button
      layout
      onClick={onClick}
      disabled={!selectable}
      className={clsx(
        'card-surface p-3 text-left w-full transition',
        isCurrentTurn && 'ring-2 ring-primary shadow-glow',
        isMe && 'border-accent',
        selectable && 'hover:scale-[1.02] cursor-pointer',
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{player.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate flex items-center gap-2">
            {player.name}
            {player.isHost && (
              <span className="pill bg-gold/30 text-gold">HOST</span>
            )}
            {isMe && <span className="pill bg-accent/30 text-accent">TÚ</span>}
          </div>
          <div className="text-xs text-muted">{player.totalScore} pts</div>
        </div>
        <span className={clsx('pill', statusColor[player.status])}>
          {statusLabel[player.status]}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 min-h-16">
        <AnimatePresence>
          {player.hand.map((c) => (
            <Card key={c.id} card={c} small />
          ))}
        </AnimatePresence>
        {player.hasSecondChance && (
          <span className="pill bg-accent/20 text-accent self-start">🛟</span>
        )}
      </div>
    </motion.button>
  );
}
