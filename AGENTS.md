<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Codebase Navigation Guide

## What to read first (in order)

1. `CLAUDE.md` — architecture map, critical decisions, conventions
2. `src/types/tft.ts` — 20 lines; defines `CostTier` and `PlayerLevel`
3. `src/lib/tft-data.ts` — Set 17 constants + 63 champion roster; read this before touching any math or UI
4. `src/lib/probability.ts` — all math; read the top-of-function comments, they explain the model
5. `src/store/calculator.ts` — small (~40 lines); just inputs and setters, no derived state

## Entry points

- **UI:** `src/app/page.tsx` → renders `<CalculatorPanel />`. The page itself is a server component with no logic.
- **Math:** `src/lib/probability.ts` exports everything; `probability.test.ts` is the fastest way to understand expected behavior.
- **State:** `src/store/calculator.ts` — `useCalculatorStore()` in any client component.

## File relationship map

```
tft-data.ts  ──────────────────────────────────────────────┐
types/tft.ts ──────┐                                        │
                   ▼                                        ▼
probability.ts ◄── probability.test.ts      calculator.ts (store)
      │                                           │
      └──────────────────────┬────────────────────┘
                             ▼
                    CalculatorPanel.tsx  ──► OddsChart.tsx (dynamic, ssr:false)
                             │
                    (renders inside)
                             ▼
                       app/page.tsx
```

`CalculatorPanel.tsx` is the only file that imports from all three of `probability.ts`, `tft-data.ts`, and `calculator.ts`. It derives `copiesLeft` / `costsLeft` from store inputs, calls `computeRollOdds`, and passes results down as props — child panels (`ResultsPanel`, `StatsPanel`) do not subscribe to the store directly.

## What to skip

- `src/app/layout.tsx` — boilerplate (font setup, metadata)
- `next.config.ts` — only has a Turbopack workspace-root workaround
- `next-env.d.ts` — auto-generated, never edit
- `src/lib/probability.test.ts` — only read when adding/changing math functions

## Key gotchas

- **Infinite re-render:** Don't put `computeRollOdds` (or anything returning a new array) in a Zustand selector. Call it in the root component and pass results as props.
- **Recharts SSR crash:** Always import `OddsChart` via `dynamic(..., { ssr: false })`.
- **Number inputs:** Use the `NumberInput` component from `CalculatorPanel.tsx`, not a raw `<input type="number">`. Direct binding to store causes the "snap to zero on backspace" bug.
- **URL sync + Suspense:** `useSearchParams()` requires a `<Suspense>` boundary. The `URLSync` component handles this — don't move `useSearchParams` elsewhere without wrapping.
- **Tailwind v4:** Uses `@theme inline` block in `globals.css`, not `tailwind.config.js`. Arbitrary values like `bg-[#09090f]` work fine.
