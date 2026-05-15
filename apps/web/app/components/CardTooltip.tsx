import { useState, type ReactNode } from 'react';
import type { Card as CardT } from '@flip7/shared';

interface CardTooltipProps {
  card: CardT;
  children: ReactNode;
}

const CARD_DESCRIPTIONS: Record<string, string> = {
  '0': '0 puntos. La más segura, pero sin riesgo.',
  '1': '1 punto. Baja risk, baja reward.',
  '2': '2 puntos. Mejor que el 1.',
  '3': '3 puntos. Punto medio.',
  '4': '4 puntos. Moderado.',
  '5': '5 puntos. Equilibrado.',
  '6': '6 puntos. Alto, pero risky.',
  '7': '7 puntos. El número mágico! FLIP 7!',
  '8': '8 puntos. Muy alto, muy risky.',
  '9': '9 puntos. Casi maximo.',
  '10': '10 puntos. Maximo numero!',
  '11': '11 puntos. Casi 12.',
  '12': '12 puntos. El maximo!',
  x2: 'DOBLE: Duplica los puntos de esta ronda.',
  '+2': '+2: Suma 2 puntos extra.',
  '+4': '+4: Suma 4 puntos extra.',
  '+6': '+6: Suma 6 puntos extra.',
  '+8': '+8: Suma 8 puntos extra.',
  '+10': '+10: Suma 10 puntos extra.',
  flip3: 'FLIP THREE: El objetivo debe tomar 3 cartas. Si se pasa, pierde!',
  freeze: 'FREEZE: El objetivo pierde su turno y queda congelado.',
  second_chance: 'Second Chance: Una carta gratis. Puede salvarte del bust!',
};

export function CardTooltip({ card, children }: CardTooltipProps) {
  const [show, setShow] = useState(false);

  const getDescription = () => {
    if (card.kind === 'number') {
      return CARD_DESCRIPTIONS[card.value.toString()] || '';
    }
    if (card.kind === 'modifier') {
      return CARD_DESCRIPTIONS[card.modifier] || '';
    }
    if (card.kind === 'action') {
      return CARD_DESCRIPTIONS[card.action] || '';
    }
    return '';
  };

  const description = getDescription();

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      {children}
      {show && description && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-surface/95 backdrop-blur-sm rounded-lg shadow-lg border border-border text-xs z-50 pointer-events-none">
          <span className="text-ink">{description}</span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface/95" />
        </div>
      )}
    </div>
  );
}
