export type CostTier = 1 | 2 | 3 | 4 | 5;

// Level 1 included for completeness; MetaTFT table starts at Level 2
export type PlayerLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

// [cost1%, cost2%, cost3%, cost4%, cost5%] — must sum to 1.0
export type LevelOdds = [number, number, number, number, number];

export interface UnitPoolState {
  copiesLeft: number; // copies of the desired unit still in the shared pool
  costsLeft: number;  // total copies of that cost tier still in the shared pool
}

export interface CalculatorState {
  level: PlayerLevel;
  gold: number;
  unitCost: CostTier;
  copiesOwned: number;
  copiesTaken: number; // copies of your specific unit taken by opponents
}
