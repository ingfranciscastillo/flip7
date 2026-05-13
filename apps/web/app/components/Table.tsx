import { motion } from 'motion/react';

interface Props {
  deckCount: number;
  discardCount: number;
}

function Stack({ count, label }: { count: number; label: string }) {
  const stackLayers = Math.min(3, Math.max(1, Math.ceil(count / 20)));

  return (
    <div className="group relative flex flex-col items-center gap-2">
      <div className="relative">
        {[...Array(stackLayers)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0 }}
            animate={
              i === 0
                ? {
                    y: [0, -3, 0],
                    scale: [1, 1.02, 1],
                  }
                : {}
            }
            transition={{ duration: 0.3 }}
            className={`
              w-16 h-22 md:w-20 md:h-28 rounded-xl border border-white/10
              bg-gradient-to-br from-accent/80 to-primary/80
              shadow-card
              ${i === 0 ? 'relative z-10' : `absolute ${i === 1 ? '-top-1 -right-1' : '-top-2 -right-2'} opacity-70`}
            `}
            style={{
              transform:
                i > 0 ? `translate(${i * 2}px, ${-i * 2}px)` : undefined,
            }}
          />
        ))}
      </div>

      <div className="text-center">
        <span className="font-mono font-bold text-lg text-ink">{count}</span>
        <span className="block text-xs text-muted">{label}</span>
      </div>

      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
        <div className="bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10 shadow-lg">
          <span className="text-xs text-ink whitespace-nowrap font-medium">
            {count} cartas
          </span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface/90" />
      </div>
    </div>
  );
}

export function Table({ deckCount, discardCount }: Props) {
  return (
    <div className="flex items-center justify-center gap-8 md:gap-16 py-4">
      <Stack count={deckCount} label="Mazo" />

      <div className="w-px h-16 bg-border/30" />

      <Stack count={discardCount} label="Descartadas" />
    </div>
  );
}
