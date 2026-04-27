import CalculatorPanel from '@/components/CalculatorPanel';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090f] text-white flex flex-col">
      <header className="border-b border-[#1e1e2e] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-lg">⚡</span>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">TFT Rolling Odds</h1>
            <p className="text-[10px] text-gray-500 -mt-0.5">Set 17 · Space Gods</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Hypergeometric + Binomial model
        </div>
      </header>
      <CalculatorPanel />
    </main>
  );
}
