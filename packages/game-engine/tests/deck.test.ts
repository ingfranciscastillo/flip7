import { describe, it, expect } from 'vitest';
import { buildDeck } from '../src/deck';

describe('deck', () => {
  it('has the right total card count', () => {
    const d = buildDeck();
    // Numbers: 1 + 1+2+3+...+12 = 1 + 78 = 79
    // Modifiers: 6
    // Actions: 9
    expect(d.length).toBe(79 + 6 + 9);
  });

  it('contains exactly N copies of each number', () => {
    const d = buildDeck();
    for (let n = 0; n <= 12; n++) {
      const expected = n === 0 ? 1 : n;
      const got = d.filter((c) => c.kind === 'number' && c.value === n).length;
      expect(got, `count of ${n}`).toBe(expected);
    }
  });
});
