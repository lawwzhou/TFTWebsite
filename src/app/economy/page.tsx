'use client';

import { useState } from 'react';
import PageNav from '@/components/PageNav';
import {
  INTEREST_TABLE,
  WIN_STREAK,
  LOSE_STREAK,
  LEVEL_XP_TABLE,
  KEY_LEVEL_UNLOCKS,
  BASE_INCOME,
  WIN_BONUS,
  getWinStreakBonus,
  getLoseStreakBonus,
  getInterest,
} from '@/lib/economy-data';

// ─── Shared primitives ────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#12121a] border border-[#1e1e2e] rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-8 h-8 rounded-lg bg-[#1e1e2e] flex items-center justify-center shrink-0">
        {icon}
      </span>
      <h2 className="text-base font-bold text-white">{children}</h2>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GoldIcon({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const cls = size === 'lg'
    ? 'w-6 h-6 text-xs'
    : 'w-5 h-5 text-[10px]';
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-amber-400 font-black text-amber-900 shrink-0 ${cls}`}>
      G
    </span>
  );
}

function FlameIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9.5 6 7 8.5 7 12.5a5.1 5.1 0 005 5.1V16c-1-.3-2-1.4-2-3.5 0-1.8 1-3 2-4.5 1 1.5 2 2.7 2 4.5 0 2.1-1 3.2-2 3.5v1.6a5.1 5.1 0 005-5.1C17 8.5 14.5 6 12 2z" />
    </svg>
  );
}

function IceFlameIcon() {
  return (
    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
      <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 4.5 13.5H11l-1 8.5 9.5-12H13L13 2z" />
    </svg>
  );
}

function HeartIcon({ className = 'text-red-400' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 17 12 21 16 17" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.88 18.09A5 5 0 0 0 18 9h-2.26A10.47 10.47 0 0 1 12 4a10.47 10.47 0 0 1-3.74 5H6a5 5 0 0 0-2.88 9.09" />
    </svg>
  );
}

function SkullIcon() {
  return (
    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="7" />
      <path d="M9 21h6M9 18v3M15 18v3" />
      <circle cx="9.5" cy="10" r="1" fill="currentColor" />
      <circle cx="14.5" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

// ─── Income Calculator ────────────────────────────────────────────────────────

function IncomeCalculator() {
  const [gold, setGold] = useState(50);
  const [streak, setStreak] = useState(0);
  const [won, setWon] = useState(true);

  const interest = getInterest(gold);
  const streakBonus = won ? getWinStreakBonus(streak) : getLoseStreakBonus(streak);
  const winBonus = won ? WIN_BONUS : 0;
  const total = BASE_INCOME + interest + winBonus + streakBonus;

  const incomeRows = [
    { label: 'Base income',                       value: BASE_INCOME,  color: 'text-gray-300' },
    { label: 'Interest',                          value: interest,     color: 'text-amber-400' },
    { label: won ? 'Win bonus' : 'No win bonus',  value: winBonus,     color: winBonus > 0 ? 'text-green-400' : 'text-gray-600' },
    { label: `${won ? 'Win' : 'Lose'} streak ×${streak}`, value: streakBonus, color: won ? 'text-orange-400' : 'text-blue-400' },
  ];

  return (
    <Card>
      <SectionTitle icon={<ChartIcon />}>Income Calculator</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-2">Gold held</p>
          <div className="flex items-center gap-3">
            <GoldIcon size="lg" />
            <input
              type="range" min={0} max={80} step={1} value={gold}
              onChange={e => setGold(Number(e.target.value))}
              className="flex-1 accent-amber-400 cursor-pointer"
            />
            <span className="font-mono font-bold text-amber-400 text-lg w-10 text-right">{gold}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1 px-7">
            {[0, 10, 20, 30, 40, 50].map(v => (
              <span key={v} className={v > 0 && gold >= v ? 'text-amber-500 font-semibold' : ''}>{v}</span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-2">Round result</p>
          <div className="flex bg-[#0d0d14] border border-[#252535] rounded-lg p-0.5">
            <button onClick={() => setWon(true)} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${won ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'}`}>
              <TrophyIcon /> Win
            </button>
            <button onClick={() => setWon(false)} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${!won ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              <SkullIcon /> Loss
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-2">
            {won ? 'Win' : 'Lose'} streak length
          </p>
          <div className="flex items-center gap-3">
            <FlameIcon className={won ? 'text-orange-400' : 'text-blue-400'} />
            <input
              type="range" min={0} max={7} step={1} value={streak}
              onChange={e => setStreak(Number(e.target.value))}
              className={`flex-1 cursor-pointer ${won ? 'accent-orange-400' : 'accent-blue-400'}`}
            />
            <span className={`font-mono font-bold text-lg w-5 text-right ${won ? 'text-orange-400' : 'text-blue-400'}`}>{streak}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#0d0d14] rounded-xl p-5">
        <div className="flex flex-col gap-2.5 mb-4">
          {incomeRows.map((row, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{row.label}</span>
              <span className={`font-mono font-bold text-base ${row.color}`}>+{row.value}g</span>
            </div>
          ))}
          <div className="border-t border-[#1e1e2e] pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Total income this round</span>
            <span className="font-mono font-bold text-2xl text-amber-400">+{total}g</span>
          </div>
        </div>

        <div className="flex h-3.5 rounded-full overflow-hidden gap-0.5">
          <div className="bg-gray-600 transition-all" style={{ width: `${(BASE_INCOME / 14) * 100}%` }} />
          <div className="bg-amber-500 transition-all" style={{ width: `${(interest / 14) * 100}%` }} />
          <div className="bg-green-500 transition-all" style={{ width: `${(winBonus / 14) * 100}%` }} />
          <div className="transition-all" style={{ width: `${(streakBonus / 14) * 100}%`, background: won ? '#fb923c' : '#60a5fa' }} />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-600 inline-block" />Base 5g</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />Interest</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />Win</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: won ? '#fb923c' : '#60a5fa' }} />Streak</span>
        </div>
      </div>
    </Card>
  );
}

// ─── Interest Table ───────────────────────────────────────────────────────────

function InterestSection() {
  return (
    <Card>
      <SectionTitle icon={<GoldIcon />}>Interest Thresholds</SectionTitle>
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">
        Every 10g you hold earns +1g interest per round, capped at +5g at 50g. Hitting these breakpoints before rolling is free gold every round.
      </p>

      <div className="flex flex-col gap-2">
        {INTEREST_TABLE.map((row) => {
          const isMax = row.interest === 5;
          const isKey = row.interest > 0;
          return (
            <div key={row.min} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              isMax ? 'bg-amber-500/10 border border-amber-500/30'
                    : isKey ? 'bg-[#0d0d14] border border-[#1e1e2e]'
                    : 'bg-[#0d0d14] border border-[#0d0d14] opacity-50'
            }`}>
              <div className="w-24 shrink-0">
                <span className="font-mono text-base font-semibold text-white">
                  {row.max === null ? `${row.min}g+` : `${row.min}–${row.max}g`}
                </span>
              </div>
              <div className="flex-1 flex gap-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`h-2.5 flex-1 rounded-full transition-all ${i <= row.interest ? 'bg-amber-400' : 'bg-[#1e1e2e]'}`} />
                ))}
              </div>
              <div className="w-20 text-right shrink-0 flex items-center justify-end gap-2">
                {row.interest > 0 ? (
                  <>
                    <span className={`font-mono font-bold text-base ${isMax ? 'text-amber-400' : 'text-amber-300'}`}>+{row.interest}g</span>
                    <GoldIcon />
                    {isMax && <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Max</span>}
                  </>
                ) : (
                  <span className="font-mono text-base text-gray-600">+0g</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-600 mt-4 leading-relaxed">
        Tip: Roll to exactly a threshold before spending. Dropping from 53g → 48g after a roll costs you 1g every round until you rebuild.
      </p>
    </Card>
  );
}

// ─── Streak Bonuses ───────────────────────────────────────────────────────────

function StreakRow({ range, bonus, type }: { range: string; bonus: number; type: 'win' | 'lose' }) {
  const isWin = type === 'win';
  const color = isWin ? 'bg-orange-400' : 'bg-blue-400';
  const textColor = isWin ? 'text-orange-400' : 'text-blue-400';
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl ${bonus > 0 ? 'bg-[#0d0d14] border border-[#1e1e2e]' : 'opacity-40'}`}>
      <div className="w-12 shrink-0">
        <span className="font-mono text-base font-semibold text-white">{range}</span>
      </div>
      <div className="flex-1 flex gap-1.5">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-2.5 flex-1 rounded-full ${i <= bonus ? color : 'bg-[#1e1e2e]'}`} />
        ))}
      </div>
      <div className="w-10 text-right shrink-0">
        {bonus > 0
          ? <span className={`font-mono font-bold text-base ${textColor}`}>+{bonus}g</span>
          : <span className="font-mono text-base text-gray-600">—</span>}
      </div>
    </div>
  );
}

function StreakSection() {
  return (
    <Card>
      <SectionTitle icon={<FlameIcon className="text-orange-400" />}>Streak Bonuses</SectionTitle>
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">
        Consecutive wins or losses grant bonus gold on top of base income. Max +3g per round. Losing also denies your opponent the +1g win bonus.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FlameIcon className="text-orange-400" />
            <p className="text-sm font-semibold text-orange-400">Win Streak</p>
          </div>
          <div className="flex flex-col gap-2">
            {WIN_STREAK.map(row => <StreakRow key={row.range} range={row.range} bonus={row.bonus} type="win" />)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <IceFlameIcon />
            <p className="text-sm font-semibold text-blue-400">Lose Streak</p>
          </div>
          <div className="flex flex-col gap-2">
            {LOSE_STREAK.map(row => <StreakRow key={row.range} range={row.range} bonus={row.bonus} type="lose" />)}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-orange-400 mb-1.5">Win-streaking</p>
          <p className="text-sm text-gray-400 leading-relaxed">Best when you have a strong early opener. Forces opponents to spend gold contesting you rather than eco-ing.</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-400 mb-1.5">Loss-streaking</p>
          <p className="text-sm text-gray-400 leading-relaxed">Intentionally losing for bonus gold and carousel priority. High risk — only viable if you can absorb the HP and have a clear power-spike plan.</p>
        </div>
      </div>
    </Card>
  );
}

// ─── XP & Leveling ───────────────────────────────────────────────────────────

function LevelingSection() {
  return (
    <Card>
      <SectionTitle icon={<BoltIcon />}>XP &amp; Leveling</SectionTitle>
      <p className="text-sm text-gray-500 mb-1 leading-relaxed">
        Buying XP costs <span className="text-amber-400 font-semibold">4g = 4 XP</span>.
        Natural XP each round (≈2–4 XP) reduces the real cost significantly.
        The gold cost below is the maximum (buying all XP from scratch).
      </p>
      <p className="text-xs text-gray-600 mb-5">Approximate for Set 17 — verify against current patch notes.</p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Level</th>
              <th className="text-left py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">XP needed</th>
              <th className="text-left py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Max gold cost</th>
              <th className="text-left py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Why it matters</th>
            </tr>
          </thead>
          <tbody>
            {LEVEL_XP_TABLE.map((row) => {
              const unlock = KEY_LEVEL_UNLOCKS[row.to];
              const isKey = !!unlock;
              return (
                <tr key={row.from} className={`border-b border-[#0d0d14] ${isKey ? 'bg-amber-500/5' : ''}`}>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-sm font-bold ${isKey ? 'bg-amber-500 text-black' : 'bg-[#1e1e2e] text-gray-400'}`}>
                      {row.to}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm text-gray-300">{row.xpNeeded} XP</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <GoldIcon />
                      <span className={`font-mono font-semibold text-sm ${isKey ? 'text-amber-400' : 'text-gray-400'}`}>{row.goldCost}g</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-500 leading-relaxed max-w-[200px]">{unlock ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── When to Roll ─────────────────────────────────────────────────────────────

interface DecisionNode {
  condition: string;
  action: string;
  detail: string;
  color: 'red' | 'amber' | 'green' | 'blue';
}

const DECISIONS: DecisionNode[] = [
  {
    condition: 'HP ≤ 30',
    action: 'Roll immediately',
    detail: 'You are in danger of elimination. Stabilize your board now — losing more rounds with this HP is unacceptable. Roll to at least a playable 2★ core.',
    color: 'red',
  },
  {
    condition: 'HP 31–50',
    action: 'Roll at 30–40g',
    detail: "You can afford to hold interest for a round or two, but don't wait long. Roll down to ~20–30g to find key units, then rebuild econ.",
    color: 'amber',
  },
  {
    condition: 'HP 51–70',
    action: 'Hold 50g, roll excess',
    detail: "You're stable. Maintain 50g for max interest and use gold above that threshold to roll or level. Only spend more if you need upgrades for a key power spike.",
    color: 'green',
  },
  {
    condition: 'HP > 70',
    action: 'Full economy',
    detail: "You're very healthy. Stay at 50g, collect max interest every round, and level at the right stages. Don't panic-roll — tempo matters less than gold here.",
    color: 'blue',
  },
];

const BORDER: Record<string, string> = { red: 'border-red-500/40 bg-red-500/5', amber: 'border-amber-500/40 bg-amber-500/5', green: 'border-green-500/40 bg-green-500/5', blue: 'border-blue-500/40 bg-blue-500/5' };
const BADGE: Record<string, string>  = { red: 'bg-red-500/20 text-red-400 border-red-500/30', amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30', green: 'bg-green-500/20 text-green-400 border-green-500/30', blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
const ACOL: Record<string, string>   = { red: 'text-red-400', amber: 'text-amber-400', green: 'text-green-400', blue: 'text-blue-400' };

function DecisionGuide() {
  return (
    <Card>
      <SectionTitle icon={<HeartIcon />}>When to Roll</SectionTitle>
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">
        HP is the primary signal. Augments, your comp, and the lobby always add nuance — treat these as starting points.
      </p>

      <div className="flex flex-col gap-3">
        {DECISIONS.map((d) => (
          <div key={d.condition} className={`border rounded-xl p-4 ${BORDER[d.color]}`}>
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1.5 shrink-0 items-start pt-0.5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${BADGE[d.color]}`}>{d.condition}</span>
                <HeartIcon className={ACOL[d.color]} />
              </div>
              <div>
                <p className={`text-base font-semibold mb-1 ${ACOL[d.color]}`}>{d.action}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{d.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Universal rules</p>
        <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
          <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5 shrink-0">·</span>Never roll below 20g unless you are in genuine danger of dying next round.</li>
          <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5 shrink-0">·</span>If you finish a round with 53g, always hold to 50g minimum before the next shop — that 3g difference costs you interest.</li>
          <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5 shrink-0">·</span>Contested units (opponents buying the same cost tier) reduce your odds — roll earlier before the pool depletes.</li>
          <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5 shrink-0">·</span>After a carousel or augment offer, re-evaluate your comp — a new unit may change your rolling target entirely.</li>
        </ul>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: 'income-calculator', label: 'Income Calculator' },
  { id: 'interest',          label: 'Interest'          },
  { id: 'streaks',           label: 'Streaks'           },
  { id: 'leveling',          label: 'XP & Leveling'     },
  { id: 'when-to-roll',      label: 'When to Roll'      },
];

export default function EconomyPage() {
  return (
    <main className="flex-1">
      <PageNav sections={NAV_SECTIONS} />

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Economy Guide</h2>
            <p className="text-sm text-gray-500 mt-0.5">Interest breakpoints, streak bonuses, leveling costs, and when to roll</p>
          </div>
          <span className="text-xs text-gray-600 bg-[#12121a] border border-[#1e1e2e] px-3 py-1.5 rounded-lg">Set 17 · Space Gods</span>
        </div>

        <section id="income-calculator" className="scroll-mt-28">
          <IncomeCalculator />
        </section>

        <section id="interest" className="scroll-mt-28">
          <InterestSection />
        </section>

        <section id="streaks" className="scroll-mt-28">
          <StreakSection />
        </section>

        <section id="leveling" className="scroll-mt-28">
          <LevelingSection />
        </section>

        <section id="when-to-roll" className="scroll-mt-28">
          <DecisionGuide />
        </section>
      </div>
    </main>
  );
}
