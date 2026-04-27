# TFT Rolling Odds Calculator

Next.js 16 (App Router) · TypeScript (strict) · Tailwind v4 · Zustand v5 · Vitest v4

## Commands
- `npm run dev` — start dev server on port 3000
- `npm test` — run Vitest unit tests
- `npm run build` — production build
- `npm run lint` — ESLint check

## Architecture

| File | Purpose |
|------|---------|
| `src/types/tft.ts` | `CostTier`, `PlayerLevel` types |
| `src/lib/tft-data.ts` | Set 17 constants: `LEVEL_ODDS`, `COPIES_PER_UNIT`, `UNITS_PER_COST`, `TOTAL_POOL`, `CHAMPIONS` (63 units) |
| `src/lib/probability.ts` | All math — pure functions only, no side effects |
| `src/lib/probability.test.ts` | 37 tests covering all math functions with known values |
| `src/store/calculator.ts` | Zustand store — raw inputs only, no derived values |
| `src/components/CalculatorPanel.tsx` | Main `'use client'` component — all UI, URL sync, calls math |
| `src/components/OddsChart.tsx` | Recharts `AreaChart` — SSR-disabled, imported via `dynamic()` |
| `src/app/page.tsx` | Server component — renders `<CalculatorPanel />` only |

### Store fields (`src/store/calculator.ts`)
`level`, `gold`, `unitCost`, `copiesOwned`, `copiesTaken`, `modelMode` (`'approximate' | 'exact'`), `otherCostTaken`

### Exported math functions (`src/lib/probability.ts`)
`comb`, `binomialProb`, `hypergeometricProb`, `shopTransitionProb`, `computeRollOdds`, `singleRollHitProb`, `singleRollDistribution`, `expectedRollsTo`

Key types: `TransitionParams { level, unitCost, copiesLeft, costsLeft }`, `RollResult { roll, goldSpent, p2Star, p3Star }`

## Math Model
Each shop is modeled as a full 5-slot draw. Within a shop, slots are drawn **without replacement** for the desired unit — hypergeometric probability — so hitting your unit in slot 1 correctly reduces the odds for slots 2–5. Slot cost odds use **binomial distribution** because cost tier draws are independent across slots; tracking total pool counts for all cost tiers isn't practical for a real player. This is a known, intentional approximation. The exact model toggle only changes how `costsLeft` is derived — the math functions are unchanged.

## Critical Architectural Decisions

**`computeRollOdds` is called in the root `CalculatorPanel`, not in the store.** Putting it in a Zustand selector returns a new array every call → Zustand detects changed reference → infinite re-render loop. Root component calls it once, passes `results` as a prop to children.

**`OddsChart` must use `dynamic(() => import('./OddsChart'), { ssr: false })`.** Recharts uses `useLayoutEffect` internally, which throws during Next.js SSR. Never import it directly.

**`NumberInput` uses local string state.** A plain `<input type="number">` bound directly to the store snaps to `0` on backspace (because `Number("") === 0`). The component keeps a local `string` state and only commits to the store when the value is parseable; normalizes to `min` on blur.

**`URLSync` must be wrapped in `<Suspense>`.** `useSearchParams()` in Next.js App Router requires a Suspense boundary or the build will warn/error. The `URLSyncInner` component does the work; `URLSync` wraps it.

**URL param sharing is implemented.** Params: `level`, `gold`, `cost`, `owned`, `taken`, `mode`, `other`. Store state is written to URL via `router.replace` on every change; hydrated from URL on mount. State is client-side only — no database.

## Conventions
- All probability functions must have Vitest unit tests with known values before UI wiring.
- TypeScript strict mode. No `any`.
- Server components by default. `"use client"` only where interactivity is needed.
- Math stays in `/lib`. Components call lib functions or read from the store — never implement math inline.

## Workflow
- Before implementing any probability function, write out the formula as a comment first. Don't write code until the formula is stated and matches the math model.
- Run tests before moving on. Don't stack unverified implementations.

## Don't
- Don't make slot cost odds "exact" by tracking all pool counts — binomial for cost tiers is the intentional design.
- Don't install new packages without checking first.
- Don't touch the math layer without running tests afterward.
