import type { CostTier, PlayerLevel, LevelOdds } from '@/types/tft';

// ─── Game mechanics (stable across sets) ─────────────────────────────────────

export const SHOP_SLOTS = 5;
export const COPIES_FOR_2STAR = 3;
export const COPIES_FOR_3STAR = 9;

// ─── Set 17: Space Gods — update these two blocks each new set ───────────────
//
// Source: MetaTFT (metatft.com/tables/shop-odds), provided 2026-04-26.
// All rows verified to sum to 1.0 (asserted in tft-data.test.ts).

export const LEVEL_ODDS: Record<PlayerLevel, LevelOdds> = {
  1:  [1.00, 0.00, 0.00, 0.00, 0.00], // same as Level 2; not in MetaTFT table
  2:  [1.00, 0.00, 0.00, 0.00, 0.00],
  3:  [0.75, 0.25, 0.00, 0.00, 0.00],
  4:  [0.55, 0.30, 0.15, 0.00, 0.00],
  5:  [0.45, 0.33, 0.20, 0.02, 0.00],
  6:  [0.30, 0.40, 0.25, 0.05, 0.00],
  7:  [0.19, 0.30, 0.40, 0.10, 0.01],
  8:  [0.15, 0.20, 0.32, 0.30, 0.03],
  9:  [0.10, 0.17, 0.25, 0.33, 0.15],
  10: [0.05, 0.10, 0.20, 0.40, 0.25],
  11: [0.01, 0.02, 0.12, 0.50, 0.35],
};

// Copies of each individual unit in the shared pool (all 8 players draw from this).
// Source: MetaTFT (metatft.com/tables/shop-odds), provided 2026-04-26.
export const COPIES_PER_UNIT: Record<CostTier, number> = {
  1: 30,
  2: 25,
  3: 18,
  4: 10,
  5: 9,
};

// ─── Verify this block each new set (count from champion list) ───────────────
//
// Number of distinct champions at each cost tier in Set 17.
// Source: mobalytics.gg/tft/champions, counted 2026-04-26.
// 1-cost Talon appeared in both tier lists on the page — counted once under tier 1.
// Drives costsLeft in the hypergeometric formula; wrong values = wrong odds.
export const UNITS_PER_COST: Record<CostTier, number> = {
  1: 14, // Aatrox Briar Caitlyn Cho'Gath Ezreal Leona Lissandra Nasus Poppy Rek'Sai Talon Teemo Twisted Fate Veigar
  2: 13, // Akali Bel'Veth Gnar Gragas Gwen Jax Jinx Meepsie Milio Mordekaiser Pantheon Pyke Zoe
  3: 13, // Aurora Diana Fizz Illaoi Kai'Sa Lulu Maokai Miss Fortune Ornn Rhaast Samira Urgot Viktor
  4: 13, // Aurelion Sol Corki Karma Kindred LeBlanc Master Yi Nami Nunu Rammus Riven Tahm Kench Xayah The Mighty Mech
  5: 10, // Bard Blitzcrank Fiora Graves Jhin Morgana Shen Sona Vex Zed
};

// ─── Derived ──────────────────────────────────────────────────────────────────

// Total copies of each cost tier in a fresh pool (before any units are purchased).
// Used as the baseline costsLeft when no units have been taken from the pool.
export const TOTAL_POOL: Record<CostTier, number> = {
  1: COPIES_PER_UNIT[1] * UNITS_PER_COST[1],
  2: COPIES_PER_UNIT[2] * UNITS_PER_COST[2],
  3: COPIES_PER_UNIT[3] * UNITS_PER_COST[3],
  4: COPIES_PER_UNIT[4] * UNITS_PER_COST[4],
  5: COPIES_PER_UNIT[5] * UNITS_PER_COST[5],
};
