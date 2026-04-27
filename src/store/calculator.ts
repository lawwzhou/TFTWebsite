import { create } from 'zustand';
import type { CostTier, PlayerLevel } from '@/types/tft';
import { COPIES_PER_UNIT, TOTAL_POOL } from '@/lib/tft-data';
import { computeRollOdds, type RollResult, type TransitionParams } from '@/lib/probability';

interface CalculatorStore {
  level: PlayerLevel;
  gold: number;
  unitCost: CostTier;
  copiesOwned: number;
  copiesTaken: number; // copies of your specific unit held by opponents

  setLevel: (v: PlayerLevel) => void;
  setGold: (v: number) => void;
  setUnitCost: (v: CostTier) => void;
  setCopiesOwned: (v: number) => void;
  setCopiesTaken: (v: number) => void;

  rollResults: () => RollResult[];
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  level: 8,
  gold: 50,
  unitCost: 3,
  copiesOwned: 0,
  copiesTaken: 0,

  setLevel: (level) => set({ level }),
  setGold: (gold) => set({ gold }),
  setUnitCost: (unitCost) => set({ unitCost }),
  setCopiesOwned: (copiesOwned) => set({ copiesOwned }),
  setCopiesTaken: (copiesTaken) => set({ copiesTaken }),

  rollResults: () => {
    const { level, gold, unitCost, copiesOwned, copiesTaken } = get();
    // All copies of the unit are either in the pool, held by you, or held by opponents.
    const copiesLeft = Math.max(COPIES_PER_UNIT[unitCost] - copiesOwned - copiesTaken, 0);
    // costsLeft approximation: only subtract known copies (yours + opponents' of this unit).
    // Other units of the same tier removed by opponents are not tracked — intentional per CLAUDE.md.
    const costsLeft = Math.max(TOTAL_POOL[unitCost] - copiesOwned - copiesTaken, 0);
    const params: TransitionParams = { level, unitCost, copiesLeft, costsLeft };
    const maxRolls = Math.floor(gold / 2);
    return computeRollOdds(copiesOwned, params, maxRolls);
  },
}));
