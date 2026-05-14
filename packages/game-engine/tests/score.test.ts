import { describe, it, expect } from 'vitest';
import { scoreHand } from '../src/score';
import type { Card } from "@flip7/shared";

const num = (v: number, id = `n${v}`): Card => ({ kind: 'number', value: v, id });
const mod = (m: '+2' | '+4' | '+6' | '+8' | '+10' | 'x2', id = `m${m}`): Card => ({
  kind: 'modifier',
  modifier: m,
  id,
});

describe('scoreHand', () => {
  it('returns 0 if busted', () => {
    expect(scoreHand([num(5), num(3)], true)).toBe(0);
  });

  it('sums numbers', () => {
    expect(scoreHand([num(5), num(3), num(7)], false)).toBe(15);
  });

  it('applies x2 before plus modifiers', () => {
    expect(scoreHand([num(5), num(3), mod('x2'), mod('+4')], false)).toBe(20);
  });

  it('adds Flip7 bonus when 7 unique numbers', () => {
    const hand = [num(1), num(2), num(3), num(4), num(5), num(6), num(7)];
    expect(scoreHand(hand, false)).toBe(28 + 15);
  });
});
