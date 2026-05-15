import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../store/gameStore';
import { Card } from './Card';

export function DealAnimationPortal() {
  const lastDealtCard = useGame((s) => s.lastDealtCard);

  return (
    <AnimatePresence>
      {lastDealtCard && (
        <motion.div
          className="fixed left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
          initial={{ opacity: 1, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 200,
          }}
        >
          <Card
            faceDown
            layoutId={`deal-${lastDealtCard.id}`}
            animate="flip3d"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
