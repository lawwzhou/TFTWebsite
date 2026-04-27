// TFT Set 17 economy constants
// Interest and base income are universal across sets.
// Streak breakpoints and XP values are approximate for Set 17 — verify against patch notes.

export const BASE_INCOME = 5;   // guaranteed gold per round
export const WIN_BONUS = 1;     // extra gold for winning the round
export const MAX_INTEREST = 5;  // interest cap (at 50g)

export interface InterestRow {
  min: number;
  max: number | null; // null = no upper bound
  interest: number;
}

export const INTEREST_TABLE: InterestRow[] = [
  { min: 0,  max: 9,    interest: 0 },
  { min: 10, max: 19,   interest: 1 },
  { min: 20, max: 29,   interest: 2 },
  { min: 30, max: 39,   interest: 3 },
  { min: 40, max: 49,   interest: 4 },
  { min: 50, max: null, interest: 5 },
];

export interface StreakRow {
  range: string;
  bonus: number;
}

export const WIN_STREAK: StreakRow[] = [
  { range: '0–1', bonus: 0 },
  { range: '2–3', bonus: 1 },
  { range: '4–5', bonus: 2 },
  { range: '6+',  bonus: 3 },
];

export const LOSE_STREAK: StreakRow[] = [
  { range: '0',   bonus: 0 },
  { range: '1–2', bonus: 1 },
  { range: '3–4', bonus: 2 },
  { range: '5+',  bonus: 3 },
];

export interface LevelRow {
  from: number;
  to: number;
  xpNeeded: number;
  goldCost: number; // ceil(xpNeeded / 4) * 4
}

// XP required to go from level N to N+1 (approximate for Set 17).
// Gold cost = ceil(xpNeeded / 4) * 4 — assumes buying all XP with no natural gain.
// Natural XP gain per round (≈2–4 XP depending on stage) reduces the real cost.
export const LEVEL_XP_TABLE: LevelRow[] = [
  { from: 2,  to: 3,  xpNeeded: 2,  goldCost: 4  },
  { from: 3,  to: 4,  xpNeeded: 2,  goldCost: 4  },
  { from: 4,  to: 5,  xpNeeded: 6,  goldCost: 8  },
  { from: 5,  to: 6,  xpNeeded: 10, goldCost: 12 },
  { from: 6,  to: 7,  xpNeeded: 20, goldCost: 20 },
  { from: 7,  to: 8,  xpNeeded: 28, goldCost: 28 },
  { from: 8,  to: 9,  xpNeeded: 36, goldCost: 36 },
  { from: 9,  to: 10, xpNeeded: 44, goldCost: 44 },
  { from: 10, to: 11, xpNeeded: 52, goldCost: 52 },
];

// The level that unlocks meaningful odds for each cost tier (first level where that tier > 0%).
export const KEY_LEVEL_UNLOCKS: Record<number, string> = {
  6: '3-cost odds improve significantly',
  7: '4-cost units appear in shop',
  8: 'Peak 4-cost odds, 5-cost appears',
  9: 'Best 5-cost odds',
};

export function getWinStreakBonus(streak: number): number {
  if (streak >= 6) return 3;
  if (streak >= 4) return 2;
  if (streak >= 2) return 1;
  return 0;
}

export function getLoseStreakBonus(streak: number): number {
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  if (streak >= 1) return 1;
  return 0;
}

export function getInterest(gold: number): number {
  return Math.min(Math.floor(gold / 10), MAX_INTEREST);
}
