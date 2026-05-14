import { describe, it, expect } from 'vitest';
import { scoreHand } from '../src/score';
import type { Card } from '@flip7/shared';

const numberCard = (value: number, id = `n_${value}`): Card => ({
  kind: 'number',
  value,
  id,
});

const modifierCard = (
  modifier: '+2' | '+4' | '+6' | '+8' | '+10' | 'x2',
  id = `m_${modifier}`,
): Card => ({
  kind: 'modifier',
  modifier,
  id,
});

describe('scoreHand', () => {
  it('returns 0 for busted hands', () => {
    expect(scoreHand([numberCard(5), numberCard(3)], true)).toBe(0);
  });

  it('sums number values', () => {
    expect(
      scoreHand([numberCard(5), numberCard(3), numberCard(2)], false),
    ).toBe(10);
  });

  it('applies x2 multiplier to numbers only', () => {
    const hand = [numberCard(5), numberCard(3), modifierCard('x2')];
    expect(scoreHand(hand, false)).toBe(16);
  });

  it('adds +N modifiers', () => {
    const hand = [numberCard(5), modifierCard('+4')];
    expect(scoreHand(hand, false)).toBe(9);
  });

  it('applies x2 before +N', () => {
    const hand = [
      numberCard(5),
      numberCard(3),
      modifierCard('x2'),
      modifierCard('+4'),
    ];
    expect(scoreHand(hand, false)).toBe(20);
  });
});
