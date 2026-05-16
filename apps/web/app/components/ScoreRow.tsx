import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ScoreRowProps {
  previousScore: number;
  currentScore: number;
  player: { name: string; emoji: string };
  delay: number;
  isCurrent?: boolean;
}

export function ScoreRow({
  previousScore,
  currentScore,
  player,
  delay,
  isCurrent = false,
}: ScoreRowProps) {
  const [display, setDisplay] = useState(0);
  const [showIncrement, setShowIncrement] = useState(false);
  const increment = currentScore - previousScore;

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 800;
      const steps = 20;
      const stepDuration = duration / steps;

      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;

        if (progress <= 0.5) {
          const prevProgress = progress * 2;
          setDisplay(Math.round(prevProgress * previousScore));
        } else if (progress <= 1) {
          const prevProgress = (progress - 0.5) * 2;
          setDisplay(Math.round(previousScore + prevProgress * increment));
        }

        if (step >= steps) {
          clearInterval(interval);
          setDisplay(currentScore);
          if (increment > 0) {
            setShowIncrement(true);
            setTimeout(() => setShowIncrement(false), 1200);
          }
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [previousScore, currentScore, increment, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + 0.2, duration: 0.3 }}
      className={`flex justify-between items-center py-1 relative ${
        isCurrent ? 'bg-accent/10 -mx-2 px-2 rounded-lg' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{player.emoji}</span>
        <span className="text-sm font-medium truncate max-w-[100px]">
          {player.name}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-bold text-lg tabular-nums">{display}</span>
        {showIncrement && (
          <motion.span
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -16, scale: 1.2 }}
            transition={{ duration: 0.8 }}
            className="text-success font-bold text-sm absolute z-[60] right-0 -top-2"
          >
            +{increment}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
