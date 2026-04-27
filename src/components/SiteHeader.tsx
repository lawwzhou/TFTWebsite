'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/',            label: 'Rolling Odds' },
  { href: '/economy',     label: 'Economy'      },
  { href: '/strategies',  label: 'Strategies'   },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#1e1e2e] px-6 py-4 flex items-center justify-between bg-[#09090f] shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-amber-400 text-xl">⚡</span>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white">TFT Tools</h1>
          <p className="text-xs text-gray-500 -mt-0.5">Set 17 · Space Gods</p>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 bg-[#12121a] border border-[#1e1e2e] rounded-xl p-1">
        {NAV.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                active
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1e1e2e]'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Set 17
      </div>
    </header>
  );
}
