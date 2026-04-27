import { create } from 'zustand';
import type { CostTier, PlayerLevel } from '@/types/tft';

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
}

export const useCalculatorStore = create<CalculatorStore>((set) => ({
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
}));
