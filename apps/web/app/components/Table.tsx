import { Card } from './Card';

interface Props {
  deckCount: number;
  discardCount: number;
}

export function Table({ deckCount, discardCount }: Props) {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <div className="flex flex-col items-center gap-1">
        <Card faceDown />
        <span className="text-xs text-muted font-mono">Mazo · {deckCount}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-20 h-28 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-xs font-mono">
          Discard
        </div>
        <span className="text-xs text-muted font-mono">{discardCount}</span>
      </div>
    </div>
  );
}
