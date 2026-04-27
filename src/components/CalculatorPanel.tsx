'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useCalculatorStore } from '@/store/calculator';
import type { CostTier, PlayerLevel } from '@/types/tft';
import { CHAMPIONS, COPIES_PER_UNIT, TOTAL_POOL } from '@/lib/tft-data';
import {
  singleRollHitProb,
  singleRollDistribution,
  expectedRollsTo,
  computeRollOdds,
  type TransitionParams,
  type RollResult,
} from '@/lib/probability';

const OddsChart = dynamic(() => import('./OddsChart'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0d0d14] animate-pulse rounded-lg" />,
});

// ─── Cost tier theme ──────────────────────────────────────────────────────────

const COST_STYLE: Record<CostTier, { ring: string; bg: string; text: string; label: string }> = {
  1: { ring: 'ring-gray-400',   bg: 'bg-gray-500',   text: 'text-gray-200', label: '1' },
  2: { ring: 'ring-green-400',  bg: 'bg-green-600',  text: 'text-green-100', label: '2' },
  3: { ring: 'ring-blue-400',   bg: 'bg-blue-600',   text: 'text-blue-100', label: '3' },
  4: { ring: 'ring-purple-400', bg: 'bg-purple-600', text: 'text-purple-100', label: '4' },
  5: { ring: 'ring-amber-400',  bg: 'bg-amber-500',  text: 'text-amber-100', label: '5' },
};

const COSTS = [1, 2, 3, 4, 5] as const;
const LEVELS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

// ─── Icons ────────────────────────────────────────────────────────────────────

function GoldIcon() {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-[9px] font-black text-amber-900 shrink-0">
      G
    </span>
  );
}

function RerollIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className={`w-3.5 h-3.5 shrink-0 ${filled ? 'text-amber-400' : 'text-gray-600'}`} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ─── Sub-sections ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
      {children}
    </p>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

// ─── Champion selector ───────────────────────────────────────────────────────

function ChampionSelector({
  selectedChampion,
  onSelect,
}: {
  selectedChampion: string;
  onSelect: (name: string, cost: CostTier) => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = search.length > 0
    ? CHAMPIONS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : CHAMPIONS;

  const grouped = COSTS.map(cost => ({
    cost,
    champions: filtered.filter(c => c.cost === cost),
  })).filter(g => g.champions.length > 0);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search champion…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-[#0d0d14] border border-[#252535] text-white text-sm rounded-lg px-3 py-2 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
      />
      {search.length > 0 && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-[#12121a] border border-[#252535] rounded-lg overflow-auto max-h-48 shadow-2xl">
          {grouped.map(({ cost, champions }) => (
            <div key={cost}>
              <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${COST_STYLE[cost].text} bg-[#0d0d14]`}>
                {cost}-cost
              </div>
              {champions.map(c => (
                <button
                  key={c.name}
                  onClick={() => { onSelect(c.name, c.cost); setSearch(''); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-[#1e1e2e] transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      {selectedChampion && (
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${COST_STYLE[CHAMPIONS.find(c => c.name === selectedChampion)?.cost ?? 1].bg} text-white`}>
            {CHAMPIONS.find(c => c.name === selectedChampion)?.cost}-cost
          </span>
          <span className="text-sm text-white font-medium">{selectedChampion}</span>
        </div>
      )}
    </div>
  );
}

// ─── Input panel ─────────────────────────────────────────────────────────────

function InputPanel() {
  const store = useCalculatorStore();
  const [selectedChampion, setSelectedChampion] = useState('');
  const maxCopies = COPIES_PER_UNIT[store.unitCost];

  function handleChampionSelect(name: string, cost: CostTier) {
    setSelectedChampion(name);
    store.setUnitCost(cost);
  }

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <SectionLabel>Unit</SectionLabel>
        <ChampionSelector selectedChampion={selectedChampion} onSelect={handleChampionSelect} />
      </div>

      <div>
        <SectionLabel>Cost tier</SectionLabel>
        <div className="flex gap-1.5">
          {COSTS.map(cost => {
            const s = COST_STYLE[cost];
            const active = store.unitCost === cost;
            return (
              <button
                key={cost}
                onClick={() => { store.setUnitCost(cost); setSelectedChampion(''); }}
                className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${s.bg} ${s.text} ${active ? `ring-2 ${s.ring} brightness-110` : 'opacity-40 hover:opacity-70'}`}
              >
                {cost}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel>Player level</SectionLabel>
        <div className="grid grid-cols-5 gap-1">
          {LEVELS.map(level => {
            const active = store.level === level;
            return (
              <button
                key={level}
                onClick={() => store.setLevel(level as PlayerLevel)}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-amber-500 text-black ring-1 ring-amber-400'
                    : 'bg-[#0d0d14] border border-[#1e1e2e] text-gray-400 hover:border-amber-500/30 hover:text-gray-200'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel>Gold to spend</SectionLabel>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <GoldIcon />
          </div>
          <input
            type="number"
            min={0}
            step={2}
            value={store.gold}
            onFocus={e => e.target.select()}
            onChange={e => store.setGold(Math.max(0, Number(e.target.value)))}
            className="w-full bg-[#0d0d14] border border-[#252535] text-white text-sm rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {Math.floor(store.gold / 2)} rolls
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <SectionLabel>Copies you own</SectionLabel>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-0.5">
              <StarIcon filled={true} />
            </div>
            <input
              type="number"
              min={0}
              max={9}
              value={store.copiesOwned}
              onFocus={e => e.target.select()}
              onChange={e => store.setCopiesOwned(Math.min(9, Math.max(0, Number(e.target.value))))}
              className="w-full bg-[#0d0d14] border border-[#252535] text-white text-sm rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              / 9
            </span>
          </div>
        </div>

        <div>
          <SectionLabel>Copies taken by opponents</SectionLabel>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <PersonIcon />
            </div>
            <input
              type="number"
              min={0}
              max={maxCopies}
              value={store.copiesTaken}
              onFocus={e => e.target.select()}
              onChange={e => store.setCopiesTaken(Math.min(maxCopies, Math.max(0, Number(e.target.value))))}
              className="w-full bg-[#0d0d14] border border-[#252535] text-white text-sm rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              / {maxCopies}
            </span>
          </div>
        </div>
      </div>

      {/* Pool remaining indicator */}
      {(() => {
        const remaining = Math.max(maxCopies - store.copiesOwned - store.copiesTaken, 0);
        const pct = (remaining / maxCopies) * 100;
        const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-amber-500' : 'bg-red-500';
        return (
          <div>
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Pool remaining</span>
              <span className={remaining === 0 ? 'text-red-400' : 'text-gray-400'}>
                {remaining} / {maxCopies} copies
              </span>
            </div>
            <div className="h-1 bg-[#0d0d14] rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            {remaining === 0 && (
              <p className="text-[10px] text-red-400 mt-1">No copies left in pool — rolling won't find this unit.</p>
            )}
          </div>
        );
      })()}
    </Card>
  );
}

// ─── Results panel (chart) ───────────────────────────────────────────────────

function ResultsPanel({ params, copiesOwned, results }: { params: TransitionParams; copiesOwned: number; results: RollResult[] }) {
  const hitProb = singleRollHitProb(copiesOwned, params);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Cumulative Roll Odds</p>
          <p className="text-xs text-gray-500 mt-0.5">Probability of hitting by roll N</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 mb-0.5">Hit chance / roll</p>
          <p className="text-xl font-bold font-mono" style={{ color: hitProb > 0.2 ? '#f5a623' : '#ef4444' }}>
            {(hitProb * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="h-56">
        <OddsChart results={results} />
      </div>

      <div className="flex gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-amber-400 inline-block rounded" />
          P(2★) cumulative
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-400 inline-block rounded" />
          P(3★) cumulative
        </span>
        <span className="ml-auto">— 50% / 90% reference lines</span>
      </div>
    </Card>
  );
}

// ─── Stats panel ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-3 flex flex-col gap-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{label}</p>
      <p className={`text-2xl font-bold font-mono ${accent ? 'text-amber-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function StatsPanel({ params, copiesOwned, gold }: { params: TransitionParams; copiesOwned: number; gold: number }) {
  const distribution = singleRollDistribution(copiesOwned, params);
  const exp2 = expectedRollsTo(copiesOwned, 'twoStar', params);
  const exp3 = expectedRollsTo(copiesOwned, 'threeStar', params);

  const fmt = (v: number) => v === Infinity ? '∞' : v.toFixed(1);
  const fmtG = (v: number) => v === Infinity ? '∞' : `${(v * 2).toFixed(0)}g`;

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-white">Stats Summary</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard
          label="Exp. rolls → 2★"
          value={fmt(exp2)}
          sub={`≈ ${fmtG(exp2)} gold`}
          accent
        />
        <StatCard
          label="Exp. rolls → 3★"
          value={fmt(exp3)}
          sub={`≈ ${fmtG(exp3)} gold`}
        />
        <StatCard
          label="Copies in pool"
          value={`${params.copiesLeft}`}
          sub={`of ${params.costsLeft} total`}
        />
        <StatCard
          label="Rolls available"
          value={`${Math.floor(gold / 2)}`}
          sub={`${gold}g budget`}
        />
      </div>

      <div>
        <SectionLabel>Per-roll copy distribution (single roll)</SectionLabel>
        <div className="flex flex-col gap-1.5">
          {distribution.map((p, gained) => {
            const pct = p * 100;
            const barColor = gained === 0 ? 'bg-gray-700' : gained === 1 ? 'bg-amber-500' : gained === 2 ? 'bg-amber-400' : 'bg-amber-300';
            return (
              <div key={gained} className="flex items-center gap-2.5 text-xs">
                <div className="flex items-center gap-1 w-20 shrink-0 text-gray-400">
                  <RerollIcon />
                  <span className="font-mono">{gained === 0 ? 'miss' : `+${gained}`}</span>
                </div>
                <div className="flex-1 bg-[#0d0d14] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className="font-mono text-gray-300 w-12 text-right">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function CalculatorPanel() {
  const store = useCalculatorStore();
  const { level, unitCost, copiesOwned, copiesTaken, gold } = store;

  const copiesLeft = Math.max(COPIES_PER_UNIT[unitCost] - copiesOwned - copiesTaken, 0);
  const costsLeft = Math.max(TOTAL_POOL[unitCost] - copiesOwned - copiesTaken, 0);
  const params: TransitionParams = { level, unitCost, copiesLeft, costsLeft };
  // Compute once here — avoids passing a selector that returns a new array (infinite loop).
  const results = computeRollOdds(copiesOwned, params, Math.floor(gold / 2));

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
      {/* Left: inputs */}
      <div className="w-full lg:w-64 shrink-0">
        <InputPanel />
      </div>

      {/* Right: chart + stats */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <ResultsPanel params={params} copiesOwned={copiesOwned} results={results} />
        <StatsPanel params={params} copiesOwned={copiesOwned} gold={gold} />
      </div>
    </div>
  );
}
