'use client';

import { useCalculatorStore } from '@/store/calculator';
import type { CostTier, PlayerLevel } from '@/types/tft';
import { COPIES_FOR_3STAR } from '@/lib/tft-data';

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const COSTS = [1, 2, 3, 4, 5] as const;
const COST_LABELS: Record<CostTier, string> = { 1: '1-cost', 2: '2-cost', 3: '3-cost', 4: '4-cost', 5: '5-cost' };

function fmt(p: number) {
  return (p * 100).toFixed(1) + '%';
}

function pColor(p: number) {
  if (p >= 0.9) return 'text-green-400';
  if (p >= 0.5) return 'text-yellow-300';
  if (p >= 0.2) return 'text-orange-400';
  return 'text-red-400';
}

export default function CalculatorPanel() {
  const store = useCalculatorStore();
  const results = store.rollResults();

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl mx-auto p-6">
      {/* ── Inputs ── */}
      <div className="flex flex-col gap-5 min-w-56">
        <h2 className="text-lg font-semibold text-white">Settings</h2>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Player level
          <select
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-white"
            value={store.level}
            onChange={e => store.setLevel(Number(e.target.value) as PlayerLevel)}
          >
            {LEVELS.map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Unit cost
          <select
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-white"
            value={store.unitCost}
            onChange={e => store.setUnitCost(Number(e.target.value) as CostTier)}
          >
            {COSTS.map(c => <option key={c} value={c}>{COST_LABELS[c]}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Copies owned&nbsp;
          <span className="text-slate-500 text-xs">(0 – {COPIES_FOR_3STAR})</span>
          <input
            type="number"
            min={0}
            max={COPIES_FOR_3STAR}
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-white w-full"
            value={store.copiesOwned}
            onChange={e => store.setCopiesOwned(Math.min(COPIES_FOR_3STAR, Math.max(0, Number(e.target.value))))}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Copies taken by opponents
          <input
            type="number"
            min={0}
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-white w-full"
            value={store.copiesTaken}
            onChange={e => store.setCopiesTaken(Math.max(0, Number(e.target.value)))}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Gold to spend
          <input
            type="number"
            min={0}
            step={2}
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-white w-full"
            value={store.gold}
            onChange={e => store.setGold(Math.max(0, Number(e.target.value)))}
          />
        </label>
      </div>

      {/* ── Results ── */}
      <div className="flex-1 overflow-auto">
        <h2 className="text-lg font-semibold text-white mb-3">Roll odds</h2>
        {results.length === 0 ? (
          <p className="text-slate-400 text-sm">Enter gold above to see odds.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 pr-4 font-medium">Roll</th>
                <th className="text-left py-2 pr-4 font-medium">Gold spent</th>
                <th className="text-left py-2 pr-4 font-medium">P(2★ by here)</th>
                <th className="text-left py-2 font-medium">P(3★ by here)</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.roll} className="border-b border-slate-800 hover:bg-slate-800/40">
                  <td className="py-1.5 pr-4 text-slate-300">{r.roll}</td>
                  <td className="py-1.5 pr-4 text-slate-300">{r.goldSpent}g</td>
                  <td className={`py-1.5 pr-4 font-mono ${pColor(r.p2Star)}`}>{fmt(r.p2Star)}</td>
                  <td className={`py-1.5 font-mono ${pColor(r.p3Star)}`}>{fmt(r.p3Star)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
