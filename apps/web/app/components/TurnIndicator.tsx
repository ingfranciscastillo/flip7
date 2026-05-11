import { motion } from 'motion/react';

interface Props {
  name: string;
  emoji: string;
  isMe: boolean;
}

export function TurnIndicator({ name, emoji, isMe }: Props) {
  return (
    <motion.div
      key={name}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface px-4 py-2 inline-flex items-center gap-2"
    >
      <span className="text-xl">{emoji}</span>
      <span className="font-semibold">
        {isMe ? '¡Es tu turno!' : `Turno de ${name}`}
      </span>
    </motion.div>
  );
}
