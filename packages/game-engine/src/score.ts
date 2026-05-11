import type { Card } from '@flip7/shared';
import { FLIP7_BONUS, isNumberCard, reachedFlip7 } from './rules';

/**
 * Score a hand at the end of a round.
 * Order: sum number values -> apply x2 -> add +N modifiers -> add Flip7 bonus.
 * Busted hands score 0.
 */
export function scoreHand(hand: Card[], busted: boolean): number {
  if (busted) return 0;
  let numberSum = 0;
  let hasX2 = false;
  let plusBonus = 0;
  for (const c of hand) {
    if (c.kind === 'number') numberSum += c.value;
    else if (c.kind === 'modifier') {
      if (c.modifier === 'x2') hasX2 = true;
      else plusBonus += parseInt(c.modifier.slice(1), 10);
    }
  }
  let total = numberSum;
  if (hasX2) total *= 2;
  total += plusBonus;
  if (reachedFlip7(hand)) total += FLIP7_BONUS;
  return total;
}

export { isNumberCard };
