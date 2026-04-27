import type { CostTier, PlayerLevel } from '@/types/tft';
import { SHOP_SLOTS, LEVEL_ODDS, COPIES_FOR_2STAR, COPIES_FOR_3STAR } from './tft-data';

const GOLD_PER_ROLL = 2;

export interface RollResult {
  roll: number;
  goldSpent: number;
  p2Star: number; // cumulative P(≥3 copies by this roll)
  p3Star: number; // cumulative P(≥9 copies by this roll)
}

// C(n, k) — iterative to avoid factorial overflow on large n.
// Returns 0 for k < 0 or k > n so callers don't need to guard those cases.
export function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k); // exploit symmetry
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

// P(exactly k out of n slots show the target cost tier).
// Cost-tier draws are treated as independent Bernoulli trials (binomial approximation).
// Formula: C(n,k) × p^k × (1−p)^(n−k)
export function binomialProb(n: number, k: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// P(exactly `observed` of the `draws` same-cost slots contain the desired unit).
// Models draws without replacement within a shop — hypergeometric distribution.
// Formula: C(successes, observed) × C(population−successes, draws−observed) / C(population, draws)
//   population = costsLeft (total copies of that cost tier in pool)
//   successes  = copiesLeft (copies of the specific desired unit in pool)
//   draws      = k (number of same-cost slots in this shop)
//   observed   = how many of those slots show our unit
export function hypergeometricProb(
  population: number,
  successes: number,
  draws: number,
  observed: number,
): number {
  if (observed < 0 || observed > successes) return 0;
  if (draws > population) return 0;
  if (draws - observed > population - successes) return 0;
  return (comb(successes, observed) * comb(population - successes, draws - observed)) / comb(population, draws);
}

export interface TransitionParams {
  level: PlayerLevel;
  unitCost: CostTier;
  copiesLeft: number; // copies of desired unit still in pool before this roll
  costsLeft: number;  // total copies of that cost tier still in pool before this roll
}

// P(going from `copiesOwned` to `targetCopies` after one 5-slot shop roll).
// For each possible number of same-cost slots k (binomial), multiplied by the
// probability that exactly `gained` of those k slots contain our unit (hypergeometric).
// Formula: Σ_{k=gained}^{SHOP_SLOTS} binomialProb(5, k, p) × hypergeometricProb(costsLeft, copiesLeft, k, gained)
export function shopTransitionProb(
  copiesOwned: number,
  targetCopies: number,
  params: TransitionParams,
): number {
  const gained = targetCopies - copiesOwned;
  if (gained < 0 || gained > SHOP_SLOTS) return 0;

  const p = LEVEL_ODDS[params.level][params.unitCost - 1];
  let total = 0;
  for (let k = gained; k <= SHOP_SLOTS; k++) {
    total += binomialProb(SHOP_SLOTS, k, p) * hypergeometricProb(params.costsLeft, params.copiesLeft, k, gained);
  }
  return total;
}

// Markov chain simulation over `maxRolls` rolls, starting from `initialOwned` copies.
//
// State space: 0..COPIES_FOR_3STAR copies owned (state 9 is absorbing — 3-star achieved).
// Pool depletion by state: as you accumulate copies, the pool shrinks. Given current state i,
// copies taken from pool = i − initialOwned, so copiesLeft(i) = copiesLeft − (i − initialOwned).
// This avoids tracking pool state separately across branches of the distribution.
//
// P(2-star by roll N) = sum of dist[3..9] after N rolls (copies never decrease).
// P(3-star by roll N) = dist[9] after N rolls (absorbing state accumulates over time).
export function computeRollOdds(
  initialOwned: number,
  params: TransitionParams,
  maxRolls: number,
): RollResult[] {
  const start = Math.min(initialOwned, COPIES_FOR_3STAR);
  const dist = new Array<number>(COPIES_FOR_3STAR + 1).fill(0);
  dist[start] = 1.0;

  const results: RollResult[] = [];

  for (let roll = 1; roll <= maxRolls; roll++) {
    const next = new Array<number>(COPIES_FOR_3STAR + 1).fill(0);

    for (let i = 0; i <= COPIES_FOR_3STAR; i++) {
      if (dist[i] === 0) continue;
      if (i === COPIES_FOR_3STAR) {
        next[COPIES_FOR_3STAR] += dist[i]; // absorbing state
        continue;
      }
      // Adjust pool for copies already collected from state initialOwned → i
      const taken = Math.max(i - initialOwned, 0);
      const rollParams: TransitionParams = {
        ...params,
        copiesLeft: Math.max(params.copiesLeft - taken, 0),
        costsLeft: Math.max(params.costsLeft - taken, 0),
      };
      for (let gained = 0; gained <= SHOP_SLOTS; gained++) {
        const p = shopTransitionProb(i, i + gained, rollParams);
        const target = Math.min(i + gained, COPIES_FOR_3STAR);
        next[target] += dist[i] * p;
      }
    }

    dist.splice(0, dist.length, ...next);

    let p2Star = 0;
    for (let i = COPIES_FOR_2STAR; i <= COPIES_FOR_3STAR; i++) p2Star += dist[i];
    const p3Star = dist[COPIES_FOR_3STAR];

    results.push({ roll, goldSpent: roll * GOLD_PER_ROLL, p2Star, p3Star });
  }

  return results;
}

// P(seeing at least 1 copy of desired unit in a single roll from current state).
export function singleRollHitProb(copiesOwned: number, params: TransitionParams): number {
  return 1 - shopTransitionProb(copiesOwned, copiesOwned, params);
}

// Distribution of copies gained in a single roll: result[k] = P(gain exactly k copies).
export function singleRollDistribution(copiesOwned: number, params: TransitionParams): number[] {
  return Array.from({ length: SHOP_SLOTS + 1 }, (_, gained) =>
    shopTransitionProb(copiesOwned, copiesOwned + gained, params),
  );
}

// Expected number of rolls to first reach target copies.
// Uses E[N] = Σ_{n=0}^{∞} P(N > n) = 1 + Σ_{k=1}^{∞} (1 − CDF(k)).
// Returns Infinity when copiesLeft = 0 (target unreachable).
export function expectedRollsTo(
  copiesOwned: number,
  target: 'twoStar' | 'threeStar',
  params: TransitionParams,
): number {
  const targetCopies = target === 'twoStar' ? COPIES_FOR_2STAR : COPIES_FOR_3STAR;
  if (copiesOwned >= targetCopies) return 0;
  if (params.copiesLeft <= 0) return Infinity;

  const results = computeRollOdds(copiesOwned, params, 500);
  let expected = 1; // P(N > 0): haven't rolled yet, not at target
  for (const r of results) {
    const cumP = target === 'twoStar' ? r.p2Star : r.p3Star;
    expected += 1 - cumP;
  }
  return expected;
}
