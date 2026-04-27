'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCalculatorStore, type ModelMode } from '@/store/calculator';
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
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
      {children}
    </p>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

// ─── Controlled number input ─────────────────────────────────────────────────
// Keeps a local string so the field can be empty mid-edit without snapping to 0.
// Commits to the store on blur (or on valid mid-type values); normalises on blur.

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

function NumberInput({ value, onChange, min = 0, max, step, className }: NumberInputProps) {
  const [local, setLocal] = useState(String(value));
  const focused = useRef(false);

  // Sync from store when blurred (e.g. cost tier change resets max)
  useEffect(() => {
    if (!focused.current) setLocal(String(value));
  }, [value]);

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={local}
      onFocus={e => { focused.current = true; e.target.select(); }}
      onChange={e => {
        setLocal(e.target.value);
        // Commit mid-type only when there's a parseable value
        if (e.target.value !== '' && !isNaN(Number(e.target.value))) {
          const clamped = Math.min(max ?? Infinity, Math.max(min, Number(e.target.value)));
          onChange(clamped);
        }
      }}
      onBlur={() => {
        focused.current = false;
        const n = local === '' || isNaN(Number(local))
          ? min
          : Math.min(max ?? Infinity, Math.max(min, Number(local)));
        onChange(n);
        setLocal(String(n));
      }}
      className={className}
    />
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
              <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${COST_STYLE[cost].text} bg-[#0d0d14]`}>
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
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${s.bg} ${s.text} ${active ? `ring-2 ${s.ring} brightness-110` : 'opacity-40 hover:opacity-70'}`}
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
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
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
          <NumberInput
            value={store.gold}
            onChange={store.setGold}
            min={0}
            step={2}
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
            <NumberInput
              value={store.copiesOwned}
              onChange={store.setCopiesOwned}
              min={0}
              max={9}
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
            <NumberInput
              value={store.copiesTaken}
              onChange={store.setCopiesTaken}
              min={0}
              max={maxCopies}
              className="w-full bg-[#0d0d14] border border-[#252535] text-white text-sm rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              / {maxCopies}
            </span>
          </div>
        </div>
      </div>

      {/* Model mode pill toggle */}
      <div>
        <SectionLabel>Probability model</SectionLabel>
        <div className="flex bg-[#0d0d14] border border-[#252535] rounded-lg p-0.5">
          {(['approximate', 'exact'] as ModelMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => store.setModelMode(mode)}
              className={`flex-1 py-2 rounded-md text-sm font-semibold capitalize transition-all ${
                store.modelMode === mode
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
          {store.modelMode === 'approximate'
            ? 'Assumes full cost-tier pool. Fast, good enough for most games.'
            : 'Input how many other same-cost cards are out to get exact odds.'}
        </p>
      </div>

      {/* Exact mode: other same-cost copies out */}
      {store.modelMode === 'exact' && (
        <div>
          <SectionLabel>Other same-cost copies out</SectionLabel>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
              {store.unitCost}★
            </div>
            <NumberInput
              value={store.otherCostTaken}
              onChange={store.setOtherCostTaken}
              min={0}
              max={TOTAL_POOL[store.unitCost] - maxCopies}
              className="w-full bg-[#0d0d14] border border-[#252535] text-white text-sm rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Other {store.unitCost}-cost copies bought by all players (not including yours).
          </p>
        </div>
      )}

      {/* Pool remaining indicator */}
      {(() => {
        const remaining = Math.max(maxCopies - store.copiesOwned - store.copiesTaken, 0);
        const pct = (remaining / maxCopies) * 100;
        const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-amber-500' : 'bg-red-500';
        return (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Pool remaining</span>
              <span className={remaining === 0 ? 'text-red-400' : 'text-gray-400'}>
                {remaining} / {maxCopies} copies
              </span>
            </div>
            <div className="h-1 bg-[#0d0d14] rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            {remaining === 0 && (
              <p className="text-xs text-red-400 mt-1">No copies left in pool — rolling won't find this unit.</p>
            )}
          </div>
        );
      })()}
    </Card>
  );
}

// ─── Results panel (chart) ───────────────────────────────────────────────────

function ResultsPanel({ params, copiesOwned, results, modelMode }: { params: TransitionParams; copiesOwned: number; results: RollResult[]; modelMode: string }) {
  const hitProb = singleRollHitProb(copiesOwned, params);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-white">Cumulative Roll Odds</p>
            <span className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${modelMode === 'exact' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {modelMode}
            </span>
            <CopyLinkButton />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Probability of hitting by roll N</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">Hit chance / roll</p>
          <p className="text-2xl font-bold font-mono" style={{ color: hitProb > 0.2 ? '#f5a623' : '#ef4444' }}>
            {(hitProb * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="h-64">
        <OddsChart results={results} />
      </div>

      <div className="flex gap-3 text-sm text-gray-500">
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
    <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
      <p className={`text-3xl font-bold font-mono ${accent ? 'text-amber-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-sm text-gray-500">{sub}</p>}
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
      <p className="text-base font-semibold text-white">Stats Summary</p>

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
              <div key={gained} className="flex items-center gap-2.5 text-sm">
                <div className="flex items-center gap-1.5 w-24 shrink-0 text-gray-400">
                  <RerollIcon />
                  <span className="font-mono">{gained === 0 ? 'miss' : `+${gained}`}</span>
                </div>
                <div className="flex-1 bg-[#0d0d14] rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className="font-mono text-gray-300 w-14 text-right">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ─── URL param sync ───────────────────────────────────────────────────────────
// Reads URL params on mount → hydrates store; writes store changes → URL.
// Wrapped in Suspense because useSearchParams() requires a Suspense boundary.

function URLSyncInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const store = useCalculatorStore();

  // Capture initial refs so the mount-only effect has no missing-deps warning
  const initParams = useRef(searchParams);
  const actions = useRef({
    setLevel: store.setLevel,
    setGold: store.setGold,
    setUnitCost: store.setUnitCost,
    setCopiesOwned: store.setCopiesOwned,
    setCopiesTaken: store.setCopiesTaken,
    setModelMode: store.setModelMode,
    setOtherCostTaken: store.setOtherCostTaken,
  });

  const [ready, setReady] = useState(false);

  // Hydrate once on mount
  useEffect(() => {
    const p = initParams.current;
    const a = actions.current;
    const level = Number(p.get('level'));
    const gold = Number(p.get('gold'));
    const cost = Number(p.get('cost'));
    const owned = Number(p.get('owned'));
    const taken = Number(p.get('taken'));
    const mode = p.get('mode');
    const other = Number(p.get('other'));

    if (p.has('level') && level >= 2 && level <= 11) a.setLevel(level as PlayerLevel);
    if (p.has('gold') && gold >= 0) a.setGold(gold);
    if (p.has('cost') && cost >= 1 && cost <= 5) a.setUnitCost(cost as CostTier);
    if (p.has('owned') && owned >= 0 && owned <= 9) a.setCopiesOwned(owned);
    if (p.has('taken') && taken >= 0) a.setCopiesTaken(taken);
    if (mode === 'approximate' || mode === 'exact') a.setModelMode(mode);
    if (p.has('other') && other >= 0) a.setOtherCostTaken(other);

    setReady(true);
  }, []);

  const { level, gold, unitCost, copiesOwned, copiesTaken, modelMode, otherCostTaken } = store;

  // Push store state to URL whenever it changes (gated on initial hydration)
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams({
      level: String(level),
      gold: String(gold),
      cost: String(unitCost),
      owned: String(copiesOwned),
      taken: String(copiesTaken),
      mode: modelMode,
      other: String(otherCostTaken),
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [ready, level, gold, unitCost, copiesOwned, copiesTaken, modelMode, otherCostTaken, router]);

  return null;
}

function URLSync() {
  return (
    <Suspense>
      <URLSyncInner />
    </Suspense>
  );
}

// ─── Copy link button ────────────────────────────────────────────────────────

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-400 transition-colors px-2 py-1 rounded-lg hover:bg-[#1e1e2e]"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function CalculatorPanel() {
  const store = useCalculatorStore();
  const { level, unitCost, copiesOwned, copiesTaken, gold, modelMode, otherCostTaken } = store;

  const copiesLeft = Math.max(COPIES_PER_UNIT[unitCost] - copiesOwned - copiesTaken, 0);
  const costsLeft = Math.max(
    TOTAL_POOL[unitCost] - copiesOwned - copiesTaken - (modelMode === 'exact' ? otherCostTaken : 0),
    0,
  );
  const params: TransitionParams = { level, unitCost, copiesLeft, costsLeft };
  // Compute once here — avoids passing a selector that returns a new array (infinite loop).
  const results = computeRollOdds(copiesOwned, params, Math.floor(gold / 2));

  return (
    <>
      <URLSync />
      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
      {/* Left: inputs */}
      <div className="w-full lg:w-80 shrink-0">
        <InputPanel />
      </div>

      {/* Right: chart + stats */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <ResultsPanel params={params} copiesOwned={copiesOwned} results={results} modelMode={modelMode} />
        <StatsPanel params={params} copiesOwned={copiesOwned} gold={gold} />
      </div>
    </div>
    </>
  );
}
