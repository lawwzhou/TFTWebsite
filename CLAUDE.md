# TFT Rolling Odds Calculator

Next.js 15 (App Router) · TypeScript (strict) · Tailwind · Zustand · Vitest

## Commands
- `npm run dev` — start dev server on port 3000
- `npm test` — run Vitest unit tests
- `npm run build` — production build
- `npm run lint` — ESLint check

## Architecture
- `src/lib/probability.ts` — all math logic (hypergeometric + binomial). Pure functions only, no side effects, fully testable.
- `src/lib/tft-data.ts` — TFT constants: pool sizes by cost tier, level odds table, max copies per unit.
- `src/store/calculator.ts` — Zustand store: level, gold, units desired, copies out, pool state.
- `src/app/` — Next.js App Router pages and Server Actions.
- `src/components/` — UI components, no math logic here.

## Math Model
Each shop is modeled as a full 5-slot draw (not matrix exponentiation). Within a shop, slots are drawn **without replacement** for the desired unit — hypergeometric probability — so hitting your unit in slot 1 correctly reduces the odds for slots 2–5. Slot cost odds use **binomial distribution** because cost tier draws are independent across slots, and tracking total pool counts for all cost tiers isn't practical for a real player. This is a known approximation; the accuracy improvement over pure matrix approaches comes from the within-shop hypergeometric model. See `src/lib/probability.ts` and `src/lib/probability.test.ts`.

## Conventions
- All probability functions must have corresponding Vitest unit tests with known values before UI wiring.
- TypeScript strict mode. No `any`. Types for all TFT game state live in `src/types/tft.ts`.
- Server components by default. `"use client"` only for interactive calculator inputs.
- Math stays in `/lib`. Components only call store selectors or lib functions — never implement math inline.

## Workflow
- Before implementing any probability function, write out the formula as a comment and confirm it matches the math model above. Don't write code until the formula is explicitly stated.
- Run tests before moving on to the next function. Don't stack multiple unverified implementations.
- If a function's logic is non-trivial, explain the reasoning in a comment above it — not just what it does, but why.

## Don't
- Don't try to make slot cost odds "exact" by tracking all pool counts — binomial for cost tiers is the intentional design choice.
- Don't add a database — all state is client-side. URL params for sharing builds.
- Don't install new packages without checking with me first.
- Don't touch the math layer without running tests.
