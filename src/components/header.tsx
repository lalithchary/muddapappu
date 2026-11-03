'use client';

import { Menu, Moon, Sun, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('muddapappu-theme');
      const isLight = saved === 'light' || (!saved && window.matchMedia('(prefers-color-scheme: light)').matches);
      setLight(isLight);
      if (isLight) {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    } catch {}
  }, []);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    if (next) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    try {
      localStorage.setItem('muddapappu-theme', next ? 'light' : 'dark');
    } catch {}
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid place-items-center overflow-hidden rounded-full bg-white/5 p-1 ring-1 ring-[var(--color-accent-primary)]/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Muddapappu" className="h-9 w-9 object-contain" />
          </span>
          <span>
            Mudda<span className="text-[var(--color-accent-primary)]">pappu</span>
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
                  active ? 'bg-[var(--color-accent-primary)] text-[var(--color-bg)]' : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]',
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
            className="hidden items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-2)] sm:inline-flex"
          >
            <ShoppingBag className="h-4 w-4" />
            All Stores
          </Link>
          <button
            onClick={toggleTheme}
            aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
            className="theme-toggle"
          >
            {light ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
            className="theme-toggle sm:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  pathname === n.href ? 'bg-[var(--color-accent-primary)] text-[var(--color-bg)]' : 'text-[var(--color-text)]',
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