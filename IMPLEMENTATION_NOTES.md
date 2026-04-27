# TFT Rolling Odds — Implementation Notes

---

## 2026-04-26 · Project scaffold

**Task completed:** Next.js 16 + TypeScript strict + Tailwind CSS v4 + Zustand v5 + Vitest v4 project scaffold.

**Reasoning:** Needed a modern, typed, testable frontend stack. Next.js App Router for server components by default; Zustand for lightweight client state without Redux overhead; Vitest for fast unit tests co-located with source.

**Decisions made:**
- Scaffolded into a temp directory `tft-scaffold` (lowercase) then copied files manually — npm rejects package names with capital letters, and the repo is named `TFTWebsite`.
- Set `"name": "tft-rolling-odds"` in package.json to satisfy npm.
- Added `turbopack: { root: __dirname }` to `next.config.ts` to silence a workspace root lockfile warning from Next.js detecting a parent-level `package-lock.json` at `C:\Users\lawre\`.
- `.claude/` added to `.gitignore` — editor-specific state (plans, settings), treated like `.vscode/`.

**Future concerns:**
- Node.js version: project requires >=20.9.0. User's machine was on v16 at start; upgraded to v24.15.0. If this project moves to CI, pin Node version explicitly.

**Next recommended step:** Define types and game constants.

---

## 2026-04-26 · Types and Set 17 constants (`src/types/tft.ts`, `src/lib/tft-data.ts`)

**Task completed:** All TFT game types and Set 17 data constants, with a full validation test suite.

**Reasoning:** Constants needed to be verified and source-attributed before any probability math could be trusted. A failing test gate on `UNITS_PER_COST` prevents moving to probability logic with wrong data.

**Decisions made:**
- `LEVEL_ODDS` sourced from MetaTFT (`metatft.com/tables/shop-odds`), provided 2026-04-26. MetaTFT is authoritative over op.gg and esportstales, which had different (incorrect) values for levels 8–9. Level 1 not in MetaTFT table — set same as Level 2 (100% 1-cost), consistent with all prior sets.
- `COPIES_PER_UNIT` classic values (30/25/18/10/9) confirmed unchanged in Set 17. MetaTFT's "Three Star requires a pool size of 27" is a derived advisory (9 copies × 3 players), not a raw pool size.
- `UNITS_PER_COST` (14/13/13/13/10) sourced from Mobalytics. Talon appeared in both 1-cost and 2-cost lists on Mobalytics — counted once under 1-cost. 3-cost count corrected from 12 to 13 after user noted Ornn was missing. 4-cost The Mighty Mech counted as a champion slot.
- Added champion name comments inline on each tier line for traceability.
- `TOTAL_POOL` is derived (`COPIES_PER_UNIT × UNITS_PER_COST`) — not a separate input, always consistent.

**Future concerns:**
- `UNITS_PER_COST` is manually counted and will go stale every set. The validation test (`has a positive integer for each cost tier`) doesn't catch wrong counts, only zero placeholders.
- When a new set drops, both `LEVEL_ODDS` and `UNITS_PER_COST` blocks need updating; `COPIES_PER_UNIT` has been stable for years but could change.

**Next recommended step:** Implement probability math layer.

---

## 2026-04-26 · Math layer (`src/lib/probability.ts`)

**Task completed:** Four pure functions: `comb`, `binomialProb`, `hypergeometricProb`, `shopTransitionProb`, and `computeRollOdds`. Full test suite with 28 known-value assertions.

**Reasoning:** All math lives in `/lib` as pure functions so it can be tested independently of UI state. Per CLAUDE.md: formula as comment first, test with known values, then implement, verify before moving to the next function.

**Decisions made:**
- **Binomial for cost-tier slot odds:** Each slot independently draws a cost tier. Tracking the full pool for all cost tiers is impractical for a real player, and would require knowing how many of *every* other unit at that tier have been purchased — intentional approximation per CLAUDE.md.
- **Hypergeometric within matching slots:** Draws of the specific desired unit within same-cost slots are modeled without replacement. Hitting it in slot 1 correctly reduces odds for slots 2–5. This is the exact part of the model.
- **`comb` implemented iteratively:** Avoids factorial overflow on large n. Multiplies numerator by `(n-i)` and divides by `(i+1)` each step. Result rounded to integer to eliminate floating-point drift.
- **`TransitionParams` exported:** Store and future callers need the type without re-importing from types/.
- **`computeRollOdds` uses Markov chain with state-dependent pool:** State `i` = copies owned. Pool depletion is derived from state: `copiesLeft(i) = copiesLeft_initial − (i − initialOwned)`. This avoids tracking pool state as a separate dimension of the distribution while still capturing the most important depletion effect (your own copies leaving the pool). `costsLeft` is adjusted the same way — the approximation is that only your unit's copies are subtracted from the total cost-tier pool (other players' copies of other units at that tier are unknown to the player).
- **State 9 (3-star) is absorbing:** Probability mass accumulates there and never transitions out. P(3-star by roll N) = `dist[9]` after N rolls. P(2-star by roll N) = `sum(dist[3..9])` — correct because copies never decrease.

**Future concerns:**
- `comb` uses `Math.round()` to correct floating-point drift. For very large n (not possible in TFT with max ~420 pool copies), this could mask precision issues.
- The pool approximation (`costsLeft` only tracks your unit's depletion) means odds are slightly optimistic when other players are heavily contesting the same cost tier. A future "advanced mode" could expose `costsLeft` as a direct user input.

**Next recommended step:** Zustand store + UI.

---

## 2026-04-26 · Zustand store (`src/store/calculator.ts`)

**Task completed:** Zustand store holding all user inputs and a `rollResults()` method that derives pool state and calls `computeRollOdds`.

**Reasoning:** Centralizing state in Zustand lets any component read inputs or results without prop drilling, and keeps the math call in one place.

**Decisions made:**
- `copiesLeft = COPIES_PER_UNIT[unitCost] - copiesOwned - copiesTaken`. All copies of the unit are either in pool, held by you, or held by opponents.
- `costsLeft = TOTAL_POOL[unitCost] - copiesOwned - copiesTaken`. Same subtraction — approximation consistent with probability layer.
- `rollResults()` is a method (not a selector with memoization) for simplicity. Acceptable because `computeRollOdds` is fast (~1ms for 25 rolls) and called only on render.
- Default state: level 8, 3-cost, 50 gold, 0 copies owned, 0 copies taken — representative of a common mid-game rolling scenario.

**Future concerns:**
- If `rollResults()` becomes slow (e.g., very high maxRolls), should memoize with `useMemo` in the component or switch to a Zustand computed value.
- URL param serialization not implemented yet. Sharing a specific calculator state requires this.

**Next recommended step:** UI component + page.

---

## 2026-04-26 · UI (`src/components/CalculatorPanel.tsx`, `src/app/page.tsx`)

**Task completed:** Full working calculator UI — inputs panel + color-coded results table.

**Reasoning:** Single-page layout with inputs on the left and a scrollable results table on the right. Dark theme (slate-900) matches TFT's aesthetic. Color coding gives instant read on odds quality without reading numbers.

**Decisions made:**
- `CalculatorPanel` is a `'use client'` component — it owns all interactive inputs. The page (`page.tsx`) is a server component that just renders the panel.
- Color scale: green ≥90%, yellow ≥50%, orange ≥20%, red <20%.
- Inputs: level (select), unit cost (select), copies owned (number input clamped 0–9), copies taken (number input), gold (number input, step=2).
- Results table shows: roll number, gold spent, P(2★ by this roll), P(3★ by this roll). All probabilities are cumulative.
- No chart yet — table gives precise numbers. A visual curve is the next logical addition.

**Future concerns:**
- No input validation feedback (e.g., copiesOwned + copiesTaken > COPIES_PER_UNIT will result in copiesLeft=0, silently). Should show a warning when pool is exhausted.
- Mobile layout: single-column stacking works but table overflows on very narrow screens. Consider horizontal scroll or condensed format.
- No URL param sharing yet — can't link to a specific calculator state.

**Next recommended step:** Probability curve chart (visual complement to the table), or URL param sharing for shareable builds.

---

## 2026-04-26 · UI redesign + charts + stats (`CalculatorPanel`, `OddsChart`, `tft-data`, `probability`)

**Task completed:** Full dashboard redesign — dark gaming theme, champion selector, cost-tier color system, cumulative odds line chart, and stats summary panel with per-roll distribution.

**Reasoning:** Previous table-only UI had no visual hierarchy or gaming feel. Reference image (dark charcoal + amber/gold accents + gradient area charts) provided the direction. TFT-specific cost-tier colors and icons (gold coin, reroll arrows, star, person) give the tool a native feel.

**Decisions made:**
- **Recharts `AreaChart` with gradient fill:** Matches the reference — amber gradient for P(2★), blue gradient for P(3★). Wrapped in `dynamic(() => import('./OddsChart'), { ssr: false })` to avoid Recharts' `useLayoutEffect` SSR warning in Next.js App Router.
- **Champion selector as search input:** Typing filters all 63 Set 17 champions by name; selecting auto-sets cost tier. Cost tier buttons remain for manual override. Champion list added directly to `tft-data.ts` (no separate file) since it's set-specific data like the rest.
- **Three math utilities added to `probability.ts`:**
  - `singleRollHitProb`: 1 − P(gain 0) for the "hit chance per roll" display.
  - `singleRollDistribution`: P(gain k) for k=0..5, shown as the per-roll distribution bars.
  - `expectedRollsTo`: E[N] = 1 + Σ(1 − CDF(k)), truncated at 500 rolls. Returns `Infinity` when `copiesLeft = 0`.
- **Pool remaining progress bar:** Visual indicator — green/amber/red based on percentage remaining. Shows explicit warning when pool is exhausted (rolling is pointless).
- **Stats summary:** 4 stat cards (exp. rolls to 2★, exp. rolls to 3★, copies in pool, rolls available) + per-roll copy distribution bars. Expected gold = expected rolls × 2.
- **Color scheme:** `#09090f` background, `#12121a` cards, `#1e1e2e` borders, `#f5a623` amber accent. Cost tiers: gray/green/blue/purple/gold matching in-game colors.

**Future concerns:**
- `expectedRollsTo` with 500-roll truncation underestimates when pool is nearly empty (very high expected values). Infinite sum truncation is the intentional approximation.
- Champion list in `tft-data.ts` will need updating each set — same maintenance cadence as `UNITS_PER_COST`.
- No URL param sharing yet — state is ephemeral, can't share a specific calculator configuration.
- Mobile layout: input panel stacks above chart on small screens but per-roll distribution bars can be tight.

**Next recommended step:** URL param serialization for shareable builds, or adding a 2★/3★ target toggle to the chart for players who only care about 2★.

---

## 2026-04-26 · Exact model toggle

**Task completed:** Pill toggle in the input panel switching between Approximate and Exact probability models. Exact mode adds an "Other same-cost copies out" input that feeds into `costsLeft`.

**Reasoning:** The approximate model derives `costsLeft` only from the player's own unit's copies being removed. In reality, every unit bought by any player depletes the total cost-tier pool. Players who are watching the game can count how many 3-costs (for example) opponents have bought, making the exact model meaningfully more accurate.

**Decisions made:**
- No new math required — `costsLeft` in `TransitionParams` was already the right abstraction. The toggle just changes how `costsLeft` is derived: `approximate = TOTAL_POOL - owned - taken`, `exact = TOTAL_POOL - owned - taken - otherCostTaken`.
- Added `modelMode: 'approximate' | 'exact'` and `otherCostTaken: number` to the Zustand store. Exact-mode input is hidden in approximate mode so it doesn't clutter the default UI.
- Added a model badge ("approximate" / "exact") to the ResultsPanel header so the user always knows which model is active.
- Max for `otherCostTaken` is capped at `TOTAL_POOL[unitCost] - maxCopies` (total pool minus your unit's copies) to prevent nonsensical values.

**Future concerns:**
- In exact mode, `costsLeft` can go to 0 if the user inputs very large `otherCostTaken`, returning `∞` expected rolls. This is correct but might be confusing without context.
- URL param sharing would need to serialize `modelMode` and `otherCostTaken` as well.

**Next recommended step:** URL param sharing so calculator states can be linked/shared.
