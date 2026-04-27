import { describe, it, expect } from 'vitest';
import { comb, binomialProb, hypergeometricProb, shopTransitionProb, computeRollOdds } from './probability';
import { SHOP_SLOTS } from './tft-data';

describe('comb', () => {
  it('base cases', () => {
    expect(comb(0, 0)).toBe(1);
    expect(comb(5, 0)).toBe(1);
    expect(comb(5, 5)).toBe(1);
  });

  it('known values', () => {
    expect(comb(5, 2)).toBe(10);
    expect(comb(10, 3)).toBe(120);
    expect(comb(6, 2)).toBe(15);
  });

  it('returns 0 for impossible k', () => {
    expect(comb(5, 6)).toBe(0);
    expect(comb(5, -1)).toBe(0);
  });
});

describe('binomialProb', () => {
  it('P(0 hits, p=0.3) = 0.7^5', () => {
    expect(binomialProb(5, 0, 0.3)).toBeCloseTo(0.16807, 10);
  });

  it('P(5 hits, p=0.3) = 0.3^5', () => {
    expect(binomialProb(5, 5, 0.3)).toBeCloseTo(0.00243, 10);
  });

  it('P(1 hit, p=0.4) = 5 × 0.4 × 0.6^4', () => {
    expect(binomialProb(5, 1, 0.4)).toBeCloseTo(0.2592, 10);
  });

  it('P(k=0, p=0) = 1 (zero probability cost tier)', () => {
    expect(binomialProb(5, 0, 0.0)).toBeCloseTo(1.0, 10);
    expect(binomialProb(5, 1, 0.0)).toBeCloseTo(0.0, 10);
  });

  it('distribution sums to 1.0', () => {
    let sum = 0;
    for (let k = 0; k <= 5; k++) sum += binomialProb(5, k, 0.3);
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe('hypergeometricProb', () => {
  // Pool: 4 total, 2 desired unit copies, draw 2 slots
  it('P(0 hits) = C(2,0)×C(2,2)/C(4,2) = 1/6', () => {
    expect(hypergeometricProb(4, 2, 2, 0)).toBeCloseTo(1 / 6, 10);
  });

  it('P(1 hit) = C(2,1)×C(2,1)/C(4,2) = 4/6', () => {
    expect(hypergeometricProb(4, 2, 2, 1)).toBeCloseTo(4 / 6, 10);
  });

  it('P(2 hits) = C(2,2)×C(2,0)/C(4,2) = 1/6', () => {
    expect(hypergeometricProb(4, 2, 2, 2)).toBeCloseTo(1 / 6, 10);
  });

  it('distribution sums to 1.0', () => {
    const sum = hypergeometricProb(4, 2, 2, 0) + hypergeometricProb(4, 2, 2, 1) + hypergeometricProb(4, 2, 2, 2);
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it('returns 0 for impossible draws (observed > successes)', () => {
    expect(hypergeometricProb(10, 2, 5, 3)).toBe(0);
  });

  it('returns 0 when draws > population', () => {
    expect(hypergeometricProb(3, 2, 5, 2)).toBe(0);
  });
});

describe('shopTransitionProb', () => {
  // Full fresh pool for a 3-cost unit: 13 units × 18 copies = 234 total
  // At level 7, 3-cost p = 0.40
  const params = { level: 7 as const, unitCost: 3 as const, copiesLeft: 18, costsLeft: 234 };

  it('gaining negative copies is impossible', () => {
    expect(shopTransitionProb(2, 1, params)).toBe(0);
  });

  it('gaining more than SHOP_SLOTS copies in one roll is impossible', () => {
    expect(shopTransitionProb(0, 6, params)).toBe(0);
  });

  it('probability mass sums to ≈ 1.0 over all reachable targets', () => {
    let sum = 0;
    for (let target = 0; target <= 0 + SHOP_SLOTS; target++) {
      sum += shopTransitionProb(0, target, params);
    }
    expect(sum).toBeCloseTo(1.0, 6);
  });

  it('P(gain 0) < 1 when copiesLeft > 0 and p > 0', () => {
    expect(shopTransitionProb(0, 0, params)).toBeLessThan(1);
  });

  it('level 2 targeting 1-cost with full pool: all 5 slots are 1-cost (p=1)', () => {
    // p=1 means all 5 slots are cost-1. hypergeom(420, 30, 5, 5) should be positive
    const p5 = shopTransitionProb(0, 5, {
      level: 2 as const,
      unitCost: 1 as const,
      copiesLeft: 30,
      costsLeft: 420,
    });
    expect(p5).toBeGreaterThan(0);
    expect(p5).toBeLessThan(1);
  });
});

describe('computeRollOdds', () => {
  // 3-cost at level 7 (p=0.40), fresh pool: copiesLeft=18, costsLeft=234
  const params = { level: 7 as const, unitCost: 3 as const, copiesLeft: 18, costsLeft: 234 };

  it('returns one entry per roll', () => {
    const results = computeRollOdds(0, params, 10);
    expect(results).toHaveLength(10);
    results.forEach((r, i) => expect(r.roll).toBe(i + 1));
  });

  it('goldSpent = roll * 2', () => {
    const results = computeRollOdds(0, params, 5);
    results.forEach(r => expect(r.goldSpent).toBe(r.roll * 2));
  });

  it('p2Star and p3Star are non-decreasing', () => {
    const results = computeRollOdds(0, params, 20);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].p2Star).toBeGreaterThanOrEqual(results[i - 1].p2Star);
      expect(results[i].p3Star).toBeGreaterThanOrEqual(results[i - 1].p3Star);
    }
  });

  it('p2Star >= p3Star always', () => {
    const results = computeRollOdds(0, params, 20);
    results.forEach(r => expect(r.p2Star).toBeGreaterThanOrEqual(r.p3Star));
  });

  it('all probabilities stay in [0, 1]', () => {
    const results = computeRollOdds(0, params, 20);
    results.forEach(r => {
      expect(r.p2Star).toBeGreaterThanOrEqual(0);
      expect(r.p2Star).toBeLessThanOrEqual(1);
      expect(r.p3Star).toBeGreaterThanOrEqual(0);
      expect(r.p3Star).toBeLessThanOrEqual(1);
    });
  });

  it('already 2-star (copiesOwned=3): p2Star=1 from roll 1', () => {
    const results = computeRollOdds(3, params, 5);
    results.forEach(r => expect(r.p2Star).toBeCloseTo(1.0, 10));
  });

  it('already 3-star (copiesOwned=9): p3Star=1 from roll 1', () => {
    const results = computeRollOdds(9, params, 5);
    results.forEach(r => expect(r.p3Star).toBeCloseTo(1.0, 10));
  });

  it('returns empty array for 0 rolls', () => {
    expect(computeRollOdds(0, params, 0)).toHaveLength(0);
  });

  it('probability strictly increases over many rolls when unit is available', () => {
    const results = computeRollOdds(0, params, 30);
    expect(results[29].p2Star).toBeGreaterThan(results[0].p2Star);
  });
});
