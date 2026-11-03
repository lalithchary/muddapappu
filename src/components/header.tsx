'use client';

import { Menu, Moon, Sun, Search, ShoppingBag, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { STORE_LIST } from '@/lib/stores';

const NAV = [
  { href: '/', label: 'Deals' },
  { href: '/coupons', label: 'Coupons' },
  { href: '/categories', label: 'Categories' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle('light', next);
    try { localStorage.setItem('muddapappu-theme', next ? 'light' : 'dark'); } catch {}
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid place-items-center overflow-hidden rounded-full bg-white/5 p-1 ring-1 ring-deal-500/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Muddapappu" className="h-9 w-9 object-contain" />
          </span>
          <span>
            Mudda<span className="text-deal-500">pappu</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  active ? 'bg-ink-800 text-white' : 'text-ink-300 hover:bg-ink-800 hover:text-white',
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-ink-300 transition-colors hover:bg-ink-800 hover:text-white sm:inline-flex"
          >
            <ShoppingBag className="h-4 w-4" />
            All Stores
          </Link>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid place-items-center rounded-lg p-2 text-ink-300 transition-colors hover:bg-ink-800 hover:text-white"
          >
            {light ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
            className="grid place-items-center rounded-lg p-2 text-ink-300 transition-colors hover:bg-ink-800 hover:text-white sm:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="border-t border-ink-800 bg-ink-950 px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  pathname === n.href ? 'bg-ink-800 text-white' : 'text-ink-300',
                )}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-wrap gap-2">
              {STORE_LIST.map((s) => (
                <span
                  key={s.id}
                  className="chip"
                  style={{ borderColor: s.color + '55', color: s.color }}
                >
                  {s.shortName}
                </span>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}