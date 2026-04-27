import CalculatorPanel from '@/components/CalculatorPanel';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">TFT Rolling Odds</h1>
        <p className="text-slate-400 text-sm mt-0.5">Set 17 · hypergeometric + binomial model</p>
      </header>
      <CalculatorPanel />
    </main>
  );
}
