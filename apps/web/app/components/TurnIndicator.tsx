import { motion } from 'motion/react';
import { useGame } from '../store/gameStore';

interface Props {
  name: string;
  emoji: string;
  isMe: boolean;
}

export function TurnIndicator({ name, emoji, isMe }: Props) {
  const turnTimeRemaining = useGame((s) => s.turnTimeRemaining);

  return (
    <motion.div
      key={name}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface px-4 py-2 inline-flex items-center gap-3"
    >
      <span className="text-xl">{emoji}</span>
      <span className="font-semibold">
        {isMe ? '¡Es tu turno!' : `Turno de ${name}`}
      </span>
      {isMe && turnTimeRemaining > 0 && (
        <div className="flex items-center gap-2 ml-2">
          <div className="w-12 h-1.5 bg-surface2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                turnTimeRemaining <= 3000 ? 'bg-danger' : 'bg-primary'
              }`}
              style={{
                width: `${Math.min((turnTimeRemaining / 10000) * 100, 100)}%`,
              }}
            />
          </div>
          <span
            className={`text-sm font-medium tabular-nums ${
              turnTimeRemaining <= 3000
                ? 'text-danger animate-pulse'
                : 'text-muted'
            }`}
          >
            {Math.ceil(turnTimeRemaining / 1000)}s
          </span>
        </div>
      )}
    </motion.div>
  );
}
