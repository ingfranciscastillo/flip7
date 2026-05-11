import type { Card } from '@flip7/shared';

let counter = 0;
const id = (prefix: string) => `${prefix}_${(++counter).toString(36)}_${Date.now().toString(36)}`;

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  // Numbers: 0×1, 1×1, 2×2, ..., 12×12
  for (let n = 0; n <= 12; n++) {
    const count = n === 0 ? 1 : n;
    for (let i = 0; i < count; i++) {
      deck.push({ kind: 'number', value: n, id: id(`n${n}`) });
    }
  }
  // Modifiers: 1 of each
  (['+2', '+4', '+6', '+8', '+10', 'x2'] as const).forEach((m) => {
    deck.push({ kind: 'modifier', modifier: m, id: id(`m${m}`) });
  });
  // Actions: 3 of each
  (['freeze', 'flip3', 'second_chance'] as const).forEach((a) => {
    for (let i = 0; i < 3; i++) deck.push({ kind: 'action', action: a, id: id(`a${a}`) });
  });
  return deck;
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}
