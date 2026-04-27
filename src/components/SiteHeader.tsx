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
    <header className="border-b border-[#1e1e2e] px-6 py-3.5 flex items-center justify-between bg-[#09090f] shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-amber-400 text-lg">⚡</span>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">TFT Tools</h1>
          <p className="text-[10px] text-gray-500 -mt-0.5">Set 17 · Space Gods</p>
        </div>
      </div>

      <nav className="flex items-center gap-1 bg-[#12121a] border border-[#1e1e2e] rounded-lg p-0.5">
        {NAV.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                active
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 text-[11px] text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Set 17
      </div>
    </header>
  );
}
