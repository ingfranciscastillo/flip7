import type { Card, NumberCard } from '@flip7/shared';

export const FLIP7_BONUS = 15;
export const TARGET_SCORE = 200;
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 8;

export function isNumberCard(c: Card): c is NumberCard {
  return c.kind === 'number';
}

export function uniqueNumbers(hand: Card[]): number[] {
  const set = new Set<number>();
  for (const c of hand) if (c.kind === 'number') set.add(c.value);
  return [...set];
}

export function wouldBust(hand: Card[], next: Card): boolean {
  if (next.kind !== 'number') return false;
  return hand.some((c) => c.kind === 'number' && c.value === next.value);
}

export function reachedFlip7(hand: Card[]): boolean {
  return uniqueNumbers(hand).length >= 7;
}
