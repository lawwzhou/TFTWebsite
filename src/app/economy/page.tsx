'use client';

import { useState } from 'react';
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
    <div className={`bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="w-7 h-7 rounded-lg bg-[#1e1e2e] flex items-center justify-center shrink-0">
        {icon}
      </span>
      <h2 className="text-sm font-bold text-white">{children}</h2>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GoldIcon({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const cls = size === 'lg'
    ? 'w-5 h-5 text-[11px]'
    : 'w-4 h-4 text-[9px]';
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
    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2v20M2 12h20M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="12" r="3" />
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
      <path d="M9 21h6" />
      <path d="M9 18v3" />
      <path d="M15 18v3" />
      <path d="M9.5 13a.5.5 0 100-1 .5.5 0 000 1z" fill="currentColor" />
      <path d="M14.5 13a.5.5 0 100-1 .5.5 0 000 1z" fill="currentColor" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
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
    { label: 'Base income',   value: BASE_INCOME,  color: 'text-gray-300', icon: null },
    { label: 'Interest',      value: interest,     color: 'text-amber-400', icon: <GoldIcon /> },
    { label: won ? 'Win bonus' : 'No win bonus', value: winBonus, color: winBonus > 0 ? 'text-green-400' : 'text-gray-600', icon: null },
    { label: `${won ? 'Win' : 'Lose'} streak +${streak}`, value: streakBonus, color: won ? 'text-orange-400' : 'text-blue-400', icon: null },
  ];

  return (
    <Card>
      <SectionTitle icon={<ChartIcon />}>Income Calculator</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Gold held */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Gold held</p>
          <div className="flex items-center gap-2">
            <GoldIcon size="lg" />
            <input
              type="range"
              min={0}
              max={80}
              step={1}
              value={gold}
              onChange={e => setGold(Number(e.target.value))}
              className="flex-1 accent-amber-400 cursor-pointer"
            />
            <span className="font-mono font-bold text-amber-400 w-8 text-right">{gold}</span>
          </div>
          <div className="flex justify-between text-[9px] text-gray-600 mt-0.5 px-6">
            {[0, 10, 20, 30, 40, 50].map(v => (
              <span key={v} className={v > 0 && gold >= v ? 'text-amber-500' : ''}>{v}</span>
            ))}
          </div>
        </div>

        {/* Win / Lose toggle */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Round result</p>
          <div className="flex bg-[#0d0d14] border border-[#252535] rounded-lg p-0.5">
            <button
              onClick={() => setWon(true)}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${won ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <TrophyIcon /> Win
            </button>
            <button
              onClick={() => setWon(false)}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${!won ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <SkullIcon /> Loss
            </button>
          </div>
        </div>

        {/* Streak */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
            {won ? 'Win' : 'Lose'} streak length
          </p>
          <div className="flex items-center gap-2">
            <span className={won ? 'text-orange-400' : 'text-blue-400'}>
              <FlameIcon className={won ? 'text-orange-400' : 'text-blue-400'} />
            </span>
            <input
              type="range"
              min={0}
              max={7}
              step={1}
              value={streak}
              onChange={e => setStreak(Number(e.target.value))}
              className={`flex-1 cursor-pointer ${won ? 'accent-orange-400' : 'accent-blue-400'}`}
            />
            <span className={`font-mono font-bold w-4 text-right ${won ? 'text-orange-400' : 'text-blue-400'}`}>{streak}</span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-[#0d0d14] rounded-xl p-4">
        <div className="flex flex-col gap-2 mb-3">
          {incomeRows.map((row, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-400 text-xs">{row.label}</span>
              <span className={`font-mono font-bold ${row.color}`}>+{row.value}g</span>
            </div>
          ))}
          <div className="border-t border-[#1e1e2e] pt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Total income</span>
            <span className="font-mono font-bold text-xl text-amber-400">+{total}g</span>
          </div>
        </div>

        {/* Visual bar */}
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          <div className="bg-gray-600 transition-all" style={{ width: `${(BASE_INCOME / 14) * 100}%` }} title="Base" />
          <div className="bg-amber-500 transition-all" style={{ width: `${(interest / 14) * 100}%` }} title="Interest" />
          <div className="bg-green-500 transition-all" style={{ width: `${(winBonus / 14) * 100}%` }} title="Win" />
          <div className="transition-all" style={{ width: `${(streakBonus / 14) * 100}%`, background: won ? '#fb923c' : '#60a5fa' }} title="Streak" />
        </div>
        <div className="flex gap-3 mt-2 text-[9px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gray-600 inline-block" />Base 5g</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />Interest</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" />Win</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: won ? '#fb923c' : '#60a5fa' }} />Streak</span>
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
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Every 10g you hold earns +1g interest per round, up to +5g at 50g. Hitting these breakpoints before rolling is free gold.
      </p>

      <div className="flex flex-col gap-1.5">
        {INTEREST_TABLE.map((row) => {
          const isMax = row.interest === 5;
          const isKey = row.interest > 0;
          return (
            <div
              key={row.min}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isMax
                  ? 'bg-amber-500/10 border border-amber-500/30'
                  : isKey
                  ? 'bg-[#0d0d14] border border-[#1e1e2e]'
                  : 'bg-[#0d0d14] border border-[#0d0d14] opacity-60'
              }`}
            >
              {/* Gold range */}
              <div className="w-20 shrink-0">
                <span className="font-mono text-sm font-semibold text-white">
                  {row.max === null ? `${row.min}g+` : `${row.min}–${row.max}g`}
                </span>
              </div>

              {/* Interest bar */}
              <div className="flex-1 flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      i <= row.interest ? 'bg-amber-400' : 'bg-[#1e1e2e]'
                    }`}
                  />
                ))}
              </div>

              {/* Interest value */}
              <div className="w-14 text-right shrink-0 flex items-center justify-end gap-1.5">
                {row.interest > 0 ? (
                  <>
                    <span className={`font-mono font-bold text-sm ${isMax ? 'text-amber-400' : 'text-amber-300'}`}>
                      +{row.interest}g
                    </span>
                    <GoldIcon />
                  </>
                ) : (
                  <span className="font-mono text-sm text-gray-600">+0g</span>
                )}
                {isMax && (
                  <span className="ml-1 text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded uppercase tracking-wider">
                    Max
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-600 mt-3 leading-relaxed">
        Tip: Roll to 50g or a threshold before spending. Dropping from 53g → 48g after a roll loses 1g/round until you rebuild.
      </p>
    </Card>
  );
}

// ─── Streak Bonuses ───────────────────────────────────────────────────────────

function StreakRow({ range, bonus, type }: { range: string; bonus: number; type: 'win' | 'lose' }) {
  const isWin = type === 'win';
  const maxBonus = 3;
  const color = isWin ? 'bg-orange-400' : 'bg-blue-400';
  const textColor = isWin ? 'text-orange-400' : 'text-blue-400';

  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${bonus > 0 ? 'bg-[#0d0d14] border border-[#1e1e2e]' : 'opacity-50'}`}>
      <div className="w-10 shrink-0">
        <span className="font-mono text-sm font-semibold text-white">{range}</span>
      </div>

      <div className="flex-1 flex gap-1">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i <= bonus ? color : 'bg-[#1e1e2e]'}`} />
        ))}
      </div>

      <div className="w-10 text-right shrink-0">
        {bonus > 0 ? (
          <span className={`font-mono font-bold text-sm ${textColor}`}>+{bonus}g</span>
        ) : (
          <span className="font-mono text-sm text-gray-600">—</span>
        )}
      </div>
    </div>
  );
}

function StreakSection() {
  return (
    <Card>
      <SectionTitle icon={<FlameIcon className="text-orange-400" />}>Streak Bonuses</SectionTitle>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Consecutive wins or losses grant bonus gold. Max +3g per round. Losing also denies your opponent the +1g win bonus.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Win streak */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <FlameIcon className="text-orange-400" />
            <p className="text-xs font-semibold text-orange-400">Win Streak</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {WIN_STREAK.map(row => (
              <StreakRow key={row.range} range={row.range} bonus={row.bonus} type="win" />
            ))}
          </div>
        </div>

        {/* Lose streak */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <IceFlameIcon />
            <p className="text-xs font-semibold text-blue-400">Lose Streak</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {LOSE_STREAK.map(row => (
              <StreakRow key={row.range} range={row.range} bonus={row.bonus} type="lose" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-orange-400 mb-1">Win-streaking</p>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Forces opponents to spend more to contest you. Best when you have strong early-game opener or can hold 50g while streaking.
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-blue-400 mb-1">Loss-streaking</p>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Intentionally losing gives bonus gold and strong carousel picks. Risky — only viable if you can absorb the HP losses and have a plan to power-spike.
          </p>
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
      <p className="text-xs text-gray-500 mb-1 leading-relaxed">
        Each <span className="text-amber-400 font-semibold">4g</span> buy gives <span className="text-amber-400 font-semibold">4 XP</span>.
        You also gain XP naturally each round (≈2 XP early, ≈4 XP mid/late game).
        Gold costs below assume force-buying all XP with no natural gain — real costs are lower.
      </p>
      <p className="text-[10px] text-gray-600 mb-4">Values approximate for Set 17 — verify against current patch notes.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left py-2 pr-4 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Level</th>
              <th className="text-left py-2 pr-4 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">XP needed</th>
              <th className="text-left py-2 pr-4 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Max gold cost</th>
              <th className="text-left py-2 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Why it matters</th>
            </tr>
          </thead>
          <tbody>
            {LEVEL_XP_TABLE.map((row) => {
              const unlock = KEY_LEVEL_UNLOCKS[row.to];
              const isKey = !!unlock;
              return (
                <tr
                  key={row.from}
                  className={`border-b border-[#0d0d14] transition-colors ${isKey ? 'bg-amber-500/5' : ''}`}
                >
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold ${
                        isKey
                          ? 'bg-amber-500 text-black'
                          : 'bg-[#1e1e2e] text-gray-400'
                      }`}>
                        {row.to}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-gray-300">{row.xpNeeded} XP</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1">
                      <GoldIcon />
                      <span className={`font-mono font-semibold ${isKey ? 'text-amber-400' : 'text-gray-400'}`}>
                        {row.goldCost}g
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-gray-500 text-[10px] leading-relaxed max-w-[200px]">
                    {unlock ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Should I Roll? ───────────────────────────────────────────────────────────

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
    detail: 'You are in danger of being eliminated. Stabilize your board now — losing more rounds with this HP is unacceptable. Roll to at least a playable 2★ core.',
    color: 'red',
  },
  {
    condition: 'HP 31–50',
    action: 'Roll at 30–40g',
    detail: 'You can afford to hold interest for a round or two, but don\'t wait long. Roll down to ~20–30g to find key units, then rebuild econ.',
    color: 'amber',
  },
  {
    condition: 'HP 51–70',
    action: 'Hold 50g, roll excess',
    detail: 'You\'re safe. Maintain 50g for max interest and use excess gold to roll or level. Only roll if you need specific upgrades for a key stage transition.',
    color: 'green',
  },
  {
    condition: 'HP > 70',
    action: 'Full econ',
    detail: 'You\'re comfortable. Stay at 50g, take interest every round, and level up at key stages. Don\'t panic-roll — tempo matters more than raw board strength here.',
    color: 'blue',
  },
];

const BORDER: Record<string, string> = {
  red:   'border-red-500/40 bg-red-500/5',
  amber: 'border-amber-500/40 bg-amber-500/5',
  green: 'border-green-500/40 bg-green-500/5',
  blue:  'border-blue-500/40 bg-blue-500/5',
};

const BADGE: Record<string, string> = {
  red:   'bg-red-500/20 text-red-400 border-red-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  blue:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const ACTION_COLOR: Record<string, string> = {
  red: 'text-red-400', amber: 'text-amber-400', green: 'text-green-400', blue: 'text-blue-400',
};

function DecisionGuide() {
  return (
    <Card>
      <SectionTitle icon={<HeartIcon />}>When to Roll</SectionTitle>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        HP is the primary signal. These are guidelines — augments, comp, and lobby context always override them.
      </p>

      <div className="flex flex-col gap-3">
        {DECISIONS.map((d) => (
          <div key={d.condition} className={`border rounded-xl p-4 ${BORDER[d.color]}`}>
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 shrink-0 items-start">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${BADGE[d.color]}`}>
                  {d.condition}
                </span>
                <HeartIcon className={ACTION_COLOR[d.color]} />
              </div>
              <div>
                <p className={`text-sm font-semibold mb-1 ${ACTION_COLOR[d.color]}`}>{d.action}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{d.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-3">
        <p className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Universal rules</p>
        <ul className="text-[11px] text-gray-400 space-y-1.5 leading-relaxed">
          <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">·</span>Never roll below 20g unless you are in genuine danger of dying next round.</li>
          <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">·</span>If you hit 50g by the end of a round, always save to 50g for next round's interest before spending.</li>
          <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">·</span>Contested units (opponents buying the same cost tier) reduce your odds significantly — roll earlier before the pool depletes.</li>
          <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">·</span>After a carousel or augment, re-evaluate your comp before rolling — a new unit may change your entire rolling target.</li>
        </ul>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EconomyPage() {
  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Economy Guide</h2>
            <p className="text-xs text-gray-500 mt-0.5">Interest, streaks, leveling, and when to roll</p>
          </div>
          <span className="text-[10px] text-gray-600 bg-[#12121a] border border-[#1e1e2e] px-2 py-1 rounded-lg">
            Set 17 · Space Gods
          </span>
        </div>

        <IncomeCalculator />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InterestSection />
          <StreakSection />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LevelingSection />
          <DecisionGuide />
        </div>
      </div>
    </main>
  );
}
