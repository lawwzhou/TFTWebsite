import { describe, it, expect } from 'vitest';
import {
  LEVEL_ODDS,
  COPIES_PER_UNIT,
  UNITS_PER_COST,
  TOTAL_POOL,
  SHOP_SLOTS,
  COPIES_FOR_3STAR,
} from './tft-data';

const COST_TIERS = [1, 2, 3, 4, 5] as const;
const PLAYER_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

describe('LEVEL_ODDS', () => {
  it('has an entry for every player level', () => {
    for (const level of PLAYER_LEVELS) {
      expect(LEVEL_ODDS[level]).toBeDefined();
    }
  });

  it('every row has exactly 5 entries', () => {
    for (const level of PLAYER_LEVELS) {
      expect(LEVEL_ODDS[level]).toHaveLength(5);
    }
  });

  it('every row sums to 1.0', () => {
    for (const level of PLAYER_LEVELS) {
      const sum = LEVEL_ODDS[level].reduce((a, b) => a + b, 0);
      expect(sum, `Level ${level} sums to ${sum}, expected 1.0`).toBeCloseTo(1.0, 10);
    }
  });

  it('all values are between 0 and 1', () => {
    for (const level of PLAYER_LEVELS) {
      for (const p of LEVEL_ODDS[level]) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('COPIES_PER_UNIT', () => {
  it('has a positive integer for each cost tier', () => {
    for (const cost of COST_TIERS) {
      const n = COPIES_PER_UNIT[cost];
      expect(Number.isInteger(n)).toBe(true);
      expect(n, `Cost ${cost} copies must be > 0`).toBeGreaterThan(0);
    }
  });
});

describe('UNITS_PER_COST', () => {
  // Intentionally fails until placeholder 0s are replaced with in-game counts.
  // Do not proceed to probability logic until this test passes.
  it('has a positive integer for each cost tier', () => {
    for (const cost of COST_TIERS) {
      const n = UNITS_PER_COST[cost];
      expect(Number.isInteger(n)).toBe(true);
      expect(
        n,
        `Cost ${cost}: replace placeholder 0 with in-game champion count`,
      ).toBeGreaterThan(0);
    }
  });
});

describe('TOTAL_POOL', () => {
  it('equals COPIES_PER_UNIT * UNITS_PER_COST for each tier', () => {
    for (const cost of COST_TIERS) {
      expect(TOTAL_POOL[cost]).toBe(COPIES_PER_UNIT[cost] * UNITS_PER_COST[cost]);
    }
  });
});

describe('game constants', () => {
  it('SHOP_SLOTS is 5', () => expect(SHOP_SLOTS).toBe(5));
  it('COPIES_FOR_3STAR is 9', () => expect(COPIES_FOR_3STAR).toBe(9));
});
