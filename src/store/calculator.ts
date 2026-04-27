import { create } from 'zustand';
import type { CostTier, PlayerLevel } from '@/types/tft';

export type ModelMode = 'approximate' | 'exact';

interface CalculatorStore {
  level: PlayerLevel;
  gold: number;
  unitCost: CostTier;
  copiesOwned: number;
  copiesTaken: number;    // copies of your specific unit held by opponents
  modelMode: ModelMode;
  otherCostTaken: number; // copies of OTHER same-cost-tier units taken (exact mode only)

  setLevel: (v: PlayerLevel) => void;
  setGold: (v: number) => void;
  setUnitCost: (v: CostTier) => void;
  setCopiesOwned: (v: number) => void;
  setCopiesTaken: (v: number) => void;
  setModelMode: (v: ModelMode) => void;
  setOtherCostTaken: (v: number) => void;
}

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  level: 8,
  gold: 50,
  unitCost: 3,
  copiesOwned: 0,
  copiesTaken: 0,
  modelMode: 'approximate',
  otherCostTaken: 0,

  setLevel: (level) => set({ level }),
  setGold: (gold) => set({ gold }),
  setUnitCost: (unitCost) => set({ unitCost }),
  setCopiesOwned: (copiesOwned) => set({ copiesOwned }),
  setCopiesTaken: (copiesTaken) => set({ copiesTaken }),
  setModelMode: (modelMode) => set({ modelMode }),
  setOtherCostTaken: (otherCostTaken) => set({ otherCostTaken }),
}));
