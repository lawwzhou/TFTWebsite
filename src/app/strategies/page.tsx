'use client';

import { useState } from 'react';
import PageNav from '@/components/PageNav';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  stage: string;
  action: string;
  detail: string;
}

interface Strategy {
  id: string;
  name: string;
  tagline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  risk: 'Low' | 'Medium' | 'High';
  levelTarget: string;
  rollTarget: string;
  goldTarget: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  badgeBg: string;
  icon: React.ReactNode;
  whenToUse: string;
  steps: Step[];
  tips: string[];
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function RerollIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 4.5 13.5H11l-1 8.5 9.5-12H13L13 2z" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 20h20v2H2zM3 9l4 4 5-8 5 8 4-4 1 9H2L3 9z" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M2 12c1.5-4 3.5-4 5 0s3.5 4 5 0 3.5-4 5 0" />
      <path d="M2 18c1.5-4 3.5-4 5 0s3.5 4 5 0 3.5-4 5 0" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function GoldIcon() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-[10px] font-black text-amber-900 shrink-0">G</span>
  );
}

// ─── Strategy data ────────────────────────────────────────────────────────────

const STRATEGIES: Strategy[] = [
  {
    id: 'reroll-cheap',
    name: 'Reroll (1 & 2-Cost)',
    tagline: 'Fast level → roll → 3-star cheap carries',
    difficulty: 'Medium',
    risk: 'Low',
    levelTarget: '5–6',
    rollTarget: 'Roll at 30–50g',
    goldTarget: 'Hold 30g minimum',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/30',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-500/20',
    icon: <span className="text-amber-400"><RerollIcon /></span>,
    whenToUse: 'Best when your lobby is not heavily contesting your carry unit, or when you find 2 copies early. Strong for 1-cost comps (level 5, full odds) and 2-cost comps (level 6, higher odds).',
    steps: [
      {
        stage: 'Stages 1–2',
        action: 'Play opener, streak if possible',
        detail: 'Don\'t roll. Save every gold — win or lose streak for bonus income. Collect component items. Look for your early copies in the shop naturally.',
      },
      {
        stage: 'Stage 2-5 or 3-1',
        action: 'Level to 5 (1-cost) or 6 (2-cost)',
        detail: 'Spend 4–12g to hit your target level. At level 5, the pool for 1-costs is strongest. At level 6, 2-cost odds are at their peak.',
      },
      {
        stage: 'Stage 3-1 to 3-3',
        action: 'Roll down to find 2-stars',
        detail: 'If HP < 70 or you have 2+ copies of your carry, roll down aggressively. Target: find your 2-star core (the carry and supporting units). Stop when stabilized or gold hits ~10g.',
      },
      {
        stage: 'Stage 3-3 onward',
        action: 'Slow roll to find 3-stars',
        detail: 'Rebuild econ to 30–50g. Each round, roll the excess above your threshold (e.g., if holding 40g, roll 10g). This keeps interest while finding the remaining copies for 3-star.',
      },
      {
        stage: 'Stage 4–5',
        action: 'Transition or augment your board',
        detail: 'Once 3-starred, decide whether to stay level 6/7 and add board support, or level to 8 for a late-game carry alongside your 3-star.',
      },
    ],
    tips: [
      'Don\'t roll at level 4 — your odds are poor and you\'re competing against a larger pool.',
      'Check how many copies opponents have bought before committing to a full rolldown.',
      'Use the Rolling Odds calculator to see exactly how many rolls you\'ll need.',
    ],
  },
  {
    id: 'reroll-3cost',
    name: '3-Cost Reroll',
    tagline: 'Level 7 → deep roll → 3-star 3-cost carry',
    difficulty: 'Medium',
    risk: 'Medium',
    levelTarget: '6–7',
    rollTarget: 'Roll at 30–50g',
    goldTarget: 'Hold 30g minimum',
    accentBg: 'bg-blue-500/10',
    accentBorder: 'border-blue-500/30',
    accentText: 'text-blue-400',
    badgeBg: 'bg-blue-500/20',
    icon: <span className="text-blue-400"><StarIcon /></span>,
    whenToUse: 'When you\'re targeting a powerful 3-cost unit and have 2+ copies by Stage 3. More expensive than cheap rerolls but stronger boards. Not viable if the unit is heavily contested.',
    steps: [
      {
        stage: 'Stages 1–2',
        action: 'Eco to 50g, accept some losses',
        detail: 'Play your strongest board but don\'t spend gold rolling. Identify your 3-cost target by Stage 2 and track how many copies you see.',
      },
      {
        stage: 'Stage 3-2',
        action: 'Level to 6, consider a small rolldown',
        detail: 'At level 6, 3-cost odds improve. If you have 2+ copies and HP < 60, roll to ~20g to find the 2-star. Otherwise hold.',
      },
      {
        stage: 'Stage 4-1',
        action: 'Level to 7, roll down for 2-star',
        detail: 'Level 7 gives the best 3-cost odds (25%). Have 50g before leveling, then roll to find your 2-star and supporting 2-stars. Stop at ~10–15g.',
      },
      {
        stage: 'Stage 4-2 onward',
        action: 'Slow roll for 3-star',
        detail: 'Rebuild to 30–40g. Roll the excess above 30g each round. At level 7 with 18 copies per 3-cost unit, finding the remaining copies takes patience.',
      },
      {
        stage: 'Stage 5+',
        action: 'Finalize board and scouting',
        detail: 'Once 3-starred, evaluate whether to stay at 7 with a complete board or level to 8 for augmenting the carry with 4-cost support.',
      },
    ],
    tips: [
      'At level 7, a 3-cost unit shows up in your shop ~25% of the time (per slot) — 5 slots × 25% chance each.',
      'If you see the unit 0 times across 10 rolls, check if opponents are holding them.',
      'Strong augments (like ones that give copies or gold) make this strategy much more consistent.',
    ],
  },
  {
    id: 'fast8',
    name: 'Fast 8',
    tagline: 'Eco → level 8 by Stage 4-1 → roll for 4-costs',
    difficulty: 'Medium',
    risk: 'Medium',
    levelTarget: '8',
    rollTarget: 'Roll at Stage 4-1',
    goldTarget: 'Hold 50g until level 8',
    accentBg: 'bg-purple-500/10',
    accentBorder: 'border-purple-500/30',
    accentText: 'text-purple-400',
    badgeBg: 'bg-purple-500/20',
    icon: <span className="text-purple-400"><BoltIcon /></span>,
    whenToUse: 'The most common mid-range strategy. Works for most standard comps that run 4-cost carries. Best when the lobby isn\'t out-leveling you early and you can survive to Stage 4 at decent HP.',
    steps: [
      {
        stage: 'Stages 1–2',
        action: 'Streak, eco to 50g',
        detail: 'Play your strongest opener. Aim for a win or losestreak for bonus income. Never roll unless a single roll would complete a 2-star for a major HP save.',
      },
      {
        stage: 'Stage 3-2',
        action: 'Level to 6, maintain 50g',
        detail: 'Spend 12g to level to 6 for better board odds. Hold 50g minimum. Identify your 4-cost carry target by scouting shops — look for what\'s uncontested.',
      },
      {
        stage: 'Stage 3-5',
        action: 'Level to 7, stay greedy',
        detail: 'Don\'t roll at 7. Every gold you spend here is one less roll you get at level 8. Only roll if HP drops below 40.',
      },
      {
        stage: 'Stage 4-1',
        action: 'Level to 8, roll down',
        detail: 'This is the power spike. Level to 8 (costs ~36g from level 7), then roll down aggressively to find your 4-cost 2-stars and a coherent board. Target ~10–20g remaining.',
      },
      {
        stage: 'Stage 4-3 onward',
        action: 'Slow roll or eco to level 9',
        detail: 'Once stabilized, decide: slow roll at 8 to upgrade units, or eco back to 50g and push level 9 for 5-cost access.',
      },
    ],
    tips: [
      'At level 8, 4-cost units appear in your shop at high rates (~36% per slot on average).',
      'Scouting at Stage 3-5: see what 4-costs opponents are holding — target the uncontested one.',
      'If you\'re below 50 HP going into Stage 4, consider rolling earlier at Stage 3-5 instead.',
    ],
  },
  {
    id: 'fast9',
    name: 'Fast 9',
    tagline: 'Hyper-eco → level 9 by Stage 5 → 5-cost units',
    difficulty: 'Hard',
    risk: 'High',
    levelTarget: '9',
    rollTarget: 'Roll at Stage 5-1',
    goldTarget: 'Hold 50g until level 9',
    accentBg: 'bg-yellow-500/10',
    accentBorder: 'border-yellow-500/30',
    accentText: 'text-yellow-400',
    badgeBg: 'bg-yellow-500/20',
    icon: <span className="text-yellow-400"><CrownIcon /></span>,
    whenToUse: 'A greedy, high-risk high-reward line. Best when you have a strong board with 1-star units that can survive to Stage 5, and when you have economy augments or are winning rounds without rolling.',
    steps: [
      {
        stage: 'Stages 1–3',
        action: 'Full eco, never roll',
        detail: 'Maintain 50g at all times. Accept losses if your 1-star board isn\'t strong enough to win — the goal is max interest until Stage 5. Win streak bonuses are a bonus, not a requirement.',
      },
      {
        stage: 'Stage 3-5 or 4-1',
        action: 'Level to 7 then 8, keep 50g',
        detail: 'Level to 7 at 3-5 and 8 at 4-1. Don\'t roll at 8. Your board is weaker than most — identify which opponents are threats and accept HP damage.',
      },
      {
        stage: 'Stage 4-3 to 5-1',
        action: 'Push level 9',
        detail: 'Level to 9 as soon as you hit 50g+ after the push. This costs significant gold from level 8. Your shop now has access to 5-cost units.',
      },
      {
        stage: 'Stage 5-1',
        action: 'Roll down for 5-costs',
        detail: 'Roll aggressively to find your 5-cost carry and 4-cost support. At level 9, 5-costs appear at ~10% per slot. Target: find 1-2 key units to stabilize.',
      },
      {
        stage: 'Stage 5+',
        action: 'Dominate late game',
        detail: 'Level 9 boards with complete 2-star 4-costs and 1-star 5-costs are among the strongest in the late game. Scout and adjust your comp based on what\'s available.',
      },
    ],
    tips: [
      'You need roughly 70+ HP to reliably reach Level 9 — if you\'re at 40 HP by Stage 3, abandon this line and roll earlier.',
      'Level 9 gives ~10% per slot on 5-costs but only ~15% on 4-costs — prioritize a 5-cost carry, not 4-cost upgrades.',
      'Watch the lobby: if 3 other players are on fast 9, the late game board quality matters less and HP becomes critical.',
    ],
  },
  {
    id: 'slow-roll',
    name: 'Slow Roll',
    tagline: 'Stay at level 6–7, roll each round to find upgrades',
    difficulty: 'Easy',
    risk: 'Low',
    levelTarget: '6–7',
    rollTarget: 'Roll 10–20g per round',
    goldTarget: 'Hold 30–50g',
    accentBg: 'bg-green-500/10',
    accentBorder: 'border-green-500/30',
    accentText: 'text-green-400',
    badgeBg: 'bg-green-500/20',
    icon: <span className="text-green-400"><WaveIcon /></span>,
    whenToUse: 'For players who don\'t want to all-in on a single rolldown. Good for 3-cost units when the pool isn\'t contested and you have time. Also used as a fallback when a fast-8 line fails.',
    steps: [
      {
        stage: 'Stages 1–2',
        action: 'Eco normally, find opener',
        detail: 'Don\'t commit to slow roll until Stage 3. Play your strongest board, streak if possible.',
      },
      {
        stage: 'Stage 3-1 or 3-2',
        action: 'Level to 6 or 7, establish floor',
        detail: 'Hit your target level (6 for 2-cost, 7 for 3-cost). From here, you will stay at this level for the foreseeable future.',
      },
      {
        stage: 'Each round from Stage 3+',
        action: 'Roll above your gold floor',
        detail: 'Every round, roll down to your floor (30g for conservative, 50g for max interest). Example: if you have 48g and your floor is 30g, roll 18g that round.',
      },
      {
        stage: 'Stage 4–5',
        action: 'Continue or transition',
        detail: 'Once 2-starred on core units, decide: continue slow rolling for 3-stars, or use your gold cushion to fast-push to level 8.',
      },
    ],
    tips: [
      'Slow roll at 50g floor gives max interest while still seeing 2–4 shops per round of XP.',
      'At 30g floor, you\'re rolling more aggressively but still have enough gold to buy interest next round.',
      'Best for non-contested 3-costs — if other players are buying the same units, your slow rolls may never find them.',
    ],
  },
];

// ─── Shared primitives ────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-[#12121a] border border-[#1e1e2e] rounded-xl ${className}`}>{children}</div>;
}

const DIFF_COLOR: Record<string, string> = { Easy: 'text-green-400 bg-green-500/10 border-green-500/20', Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20', Hard: 'text-red-400 bg-red-500/10 border-red-500/20' };
const RISK_COLOR: Record<string, string> = { Low: 'text-green-400', Medium: 'text-amber-400', High: 'text-red-400' };

// ─── Strategy card ────────────────────────────────────────────────────────────

function StrategyCard({ s, open, onToggle }: { s: Strategy; open: boolean; onToggle: () => void }) {
  return (
    <Card className="overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className={`w-full text-left p-6 flex items-start gap-4 transition-colors ${open ? '' : 'hover:bg-[#1a1a25]'}`}
      >
        {/* Icon badge */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${s.accentBg} ${s.accentBorder}`}>
          {s.icon}
        </div>

        {/* Title block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-base font-bold text-white">{s.name}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${DIFF_COLOR[s.difficulty]}`}>{s.difficulty}</span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{s.tagline}</p>

          {/* Key metrics row */}
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Level</span>
              <span className={`text-sm font-bold font-mono ${s.accentText}`}>{s.levelTarget}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Roll when</span>
              <span className={`text-sm font-bold ${s.accentText}`}>{s.rollTarget}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Risk</span>
              <span className={`text-sm font-bold ${RISK_COLOR[s.risk]}`}>{s.risk}</span>
            </div>
          </div>
        </div>

        {/* Chevron */}
        <svg
          className={`w-5 h-5 text-gray-500 shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded content */}
      {open && (
        <div className={`border-t ${s.accentBorder} px-6 pb-6`}>
          {/* When to use */}
          <div className={`mt-5 rounded-xl p-4 ${s.accentBg} border ${s.accentBorder}`}>
            <p className={`text-sm font-semibold mb-1.5 ${s.accentText}`}>When to use this</p>
            <p className="text-sm text-gray-300 leading-relaxed">{s.whenToUse}</p>
          </div>

          {/* Steps */}
          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Stage-by-stage</p>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-[#1e1e2e]" />

              <div className="flex flex-col gap-4">
                {s.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    {/* Dot */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 z-10 ${s.accentBorder} bg-[#12121a]`}>
                      <span className={`text-[10px] font-bold ${s.accentText}`}>{i + 1}</span>
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${s.badgeBg} ${s.accentText}`}>{step.stage}</span>
                        <span className="text-sm font-semibold text-white">{step.action}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-5 bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Tips</p>
            <ul className="flex flex-col gap-2">
              {s.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400 leading-relaxed">
                  <span className={`shrink-0 mt-0.5 font-bold ${s.accentText}`}>·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Stage Reference table ────────────────────────────────────────────────────

const STAGE_REF = [
  { stage: '1-1 to 1-4', reroll: 'Find opener units naturally', fast8: 'Same', fast9: 'Same', slow: 'Same' },
  { stage: '2-1',        reroll: 'Pick eco/combat augment', fast8: 'Pick eco augment if available', fast9: 'Pick eco augment', slow: 'Pick augment' },
  { stage: '2-5',        reroll: 'Level to 5 (1-cost) or hold', fast8: 'Hold gold, don\'t level yet', fast9: 'Hold 50g', slow: 'Hold 50g' },
  { stage: '3-1',        reroll: 'Level to 6 (2-cost). Roll if HP < 60', fast8: 'Hold 50g', fast9: 'Hold 50g', slow: 'Level 6, start rolling excess' },
  { stage: '3-2',        reroll: 'Roll for 2-stars at level 6', fast8: 'Level to 6, hold gold', fast9: 'Hold 50g', slow: 'Roll 10–20g/round' },
  { stage: '3-5',        reroll: 'Slow roll for 3-stars', fast8: 'Level to 7, hold gold', fast9: 'Level to 7, hold 50g', slow: 'Level 7, roll excess' },
  { stage: '4-1',        reroll: 'Still slow rolling', fast8: '⚡ Level to 8! Roll down.', fast9: 'Level to 8, hold 50g', slow: 'Continue rolling' },
  { stage: '4-5',        reroll: 'Transition or eco', fast8: 'Rebuild econ or push 9', fast9: '👑 Level to 9! Roll down.', slow: 'Decide: push 8 or continue' },
];

function StageReference() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-base font-bold text-white">Stage Reference by Strategy</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">
        What to do at each key stage depending on your chosen strategy. Use as a quick cheat sheet during games.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500 min-w-[90px]">Stage</th>
              <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-amber-500 min-w-[150px]">Reroll</th>
              <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-purple-400 min-w-[150px]">Fast 8</th>
              <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-yellow-400 min-w-[150px]">Fast 9</th>
              <th className="text-left py-3 text-xs font-semibold uppercase tracking-wider text-green-400 min-w-[150px]">Slow Roll</th>
            </tr>
          </thead>
          <tbody>
            {STAGE_REF.map((row, i) => (
              <tr key={i} className="border-b border-[#0d0d14]">
                <td className="py-3 pr-4 font-mono text-sm font-semibold text-white">{row.stage}</td>
                <td className="py-3 pr-4 text-gray-400 text-sm leading-relaxed">{row.reroll}</td>
                <td className="py-3 pr-4 text-gray-400 text-sm leading-relaxed">{row.fast8}</td>
                <td className="py-3 pr-4 text-gray-400 text-sm leading-relaxed">{row.fast9}</td>
                <td className="py-3 text-gray-400 text-sm leading-relaxed">{row.slow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: 'reroll-cheap',    label: 'Reroll (1/2-cost)' },
  { id: 'reroll-3cost',    label: '3-Cost Reroll'      },
  { id: 'fast8',           label: 'Fast 8'             },
  { id: 'fast9',           label: 'Fast 9'             },
  { id: 'slow-roll',       label: 'Slow Roll'          },
  { id: 'stage-reference', label: 'Stage Reference'    },
];

const STRATEGY_IDS = new Set(STRATEGIES.map(s => s.id));

export default function StrategiesPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenId(prev => prev === id ? null : id);
  }

  // When navigating via PageNav: open the accordion for strategy sections
  function handleNavigate(id: string) {
    if (STRATEGY_IDS.has(id)) setOpenId(id);
  }

  return (
    <main className="flex-1">
      <PageNav sections={NAV_SECTIONS} maxWidth="max-w-4xl" onNavigate={handleNavigate} />

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Rolldown Strategies</h2>
            <p className="text-sm text-gray-500 mt-0.5">Stage-by-stage guides for every major TFT economy line</p>
          </div>
          <div className="flex items-center gap-2">
            <GoldIcon />
            <span className="text-sm text-gray-500">Click a strategy to expand</span>
          </div>
        </div>

        {/* Strategy cards — accordion, each with its own scroll target */}
        <div className="flex flex-col gap-3">
          {STRATEGIES.map(s => (
            <div key={s.id} id={s.id} className="scroll-mt-28">
              <StrategyCard
                s={s}
                open={openId === s.id}
                onToggle={() => toggle(s.id)}
              />
            </div>
          ))}
        </div>

        {/* Stage reference table */}
        <div id="stage-reference" className="scroll-mt-28">
          <StageReference />
        </div>

        <p className="text-xs text-gray-600 text-center pb-4">
          Stage timings are guidelines for standard lobbies. Augments, contested units, and HP deviations all affect the optimal line.
        </p>
      </div>
    </main>
  );
}
