import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import type { PlayerPublic } from '@flip7/shared';
import { Card } from './Card';
import { useGame } from '../store/gameStore';

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
  const lastDealtCardId = useGame((s) => s.lastDealtCardId);

  const isDisconnected = !player.connected;

  return (
    <motion.button
      layout
      onClick={onClick}
      disabled={!selectable}
      className={clsx(
        'card-surface p-3 text-left w-full transition relative',
        isCurrentTurn && 'ring-2 ring-primary shadow-glow',
        isMe && 'border-accent',
        selectable && 'hover:scale-[1.02] cursor-pointer',
        isDisconnected && 'opacity-60',
        player.status === 'busted' && 'feedback-shake',
        player.status === 'frozen' && 'feedback-freeze',
      )}
    >
      {isDisconnected && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="w-2 h-2 bg-danger rounded-full animate-pulse" />
          <span className="text-xs text-danger font-medium">Offline</span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{player.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate flex items-center gap-2">
            {player.name}
            {player.isHost && (
              <span className="pill bg-gold/30 text-gold">HOST</span>
            )}
            {isMe && <span className="pill bg-accent/30 text-accent">TÚ</span>}
            {isCurrentTurn && (
              <span
                className="flex gap-0.5 items-center"
                aria-label="Turno actual"
              >
                <span
                  className="w-1 h-1 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-1 h-1 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-1 h-1 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </span>
            )}
          </div>
          <div className="text-xs text-muted">{player.totalScore} pts</div>
        </div>
        {!isDisconnected && (
          <span className={clsx('pill', statusColor[player.status])}>
            {statusLabel[player.status]}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1 min-h-16">
        <AnimatePresence>
          {player.hand.map((c, index) => {
            const isNewCard = c.id === lastDealtCardId;
            const isFirstCard = index === 0 && player.hand.length === 1;
            const isLastCard = index === player.hand.length - 1;

            let animate:
              | 'enter'
              | 'flip'
              | 'bounce'
              | 'shake'
              | 'glow'
              | 'frozen'
              | 'none' = 'none';

            if (isNewCard) {
              if (player.status === 'busted') {
                animate = 'shake';
              } else if (player.status === 'flip7') {
                animate = 'glow';
              } else if (player.status === 'frozen') {
                animate = 'frozen';
              } else if (player.status === 'stayed') {
                animate = 'bounce';
              } else if (c.kind === 'modifier') {
                animate = 'bounce';
              } else {
                animate = 'enter';
              }
            }

            return (
              <Card
                key={c.id}
                card={c}
                small
                animate={animate}
                delay={isLastCard ? 0 : index * 0.05}
                highlight={isNewCard && player.status === 'active'}
                layoutId={isNewCard ? `deal-${c.id}` : undefined}
              />
            );
          })}
        </AnimatePresence>
        {player.hasSecondChance && (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' as const, damping: 8 }}
            className="pill bg-accent/20 text-accent self-start"
          >
            🛟
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
