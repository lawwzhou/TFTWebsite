'use client';

import { useState, useEffect } from 'react';

export interface NavSection {
  id: string;
  label: string;
}

interface PageNavProps {
  sections: NavSection[];
  maxWidth?: string;
  /** Called when a nav item is clicked — lets pages react (e.g. open an accordion). */
  onNavigate?: (id: string) => void;
}

const SCROLL_OFFSET = 108; // sticky header (~56px) + this nav (~44px) + breathing room

export default function PageNav({ sections, maxWidth = 'max-w-6xl', onNavigate }: PageNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');

  // Track active section by scroll position
  useEffect(() => {
    function getActive() {
      const scrollY = window.scrollY + SCROLL_OFFSET + 16;
      let current = sections[0]?.id ?? '';
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) current = id;
      }
      return current;
    }

    function onScroll() { setActiveId(getActive()); }
    window.addEventListener('scroll', onScroll, { passive: true });
    setActiveId(getActive());
    return () => window.removeEventListener('scroll', onScroll);
  }, [sections]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    onNavigate?.(id);
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveId(id);
  }

  return (
    <div className="sticky top-0 z-20 bg-[#09090f]/95 backdrop-blur-sm border-b border-[#1e1e2e]">
      <div className={`${maxWidth} mx-auto px-4 py-2 flex gap-1 overflow-x-auto`}
        style={{ scrollbarWidth: 'none' }}>
        {sections.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={e => handleClick(e, id)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeId === id
                ? 'bg-amber-500 text-black'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1e1e2e]'
            }`}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
