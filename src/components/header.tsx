'use client';

import { Menu, Moon, Sun } from 'lucide-react';
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
    <header className="header border-b border-[var(--color-border)] bg-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-3 font-display text-xl font-bold">
          <div className="relative h-8 w-8">
            <svg
              viewBox="0 0 100 100"
              width="100%"
              height="100%"
              className="text-accent-orange"
              fill="none"
            >
              <circle cx="50" cy="50" r="46" fill="#8B7D6B" />
              <circle cx="50" cy="50" r="42" fill="#A89987" />
              <circle cx="50" cy="50" r="38" fill="#B8AA97" />
              <g stroke="#9A8C79" strokeWidth="2" strokeDasharray="4 6" fill="none">
                <circle cx="50" cy="50" r="34" />
              </g>
              <path d="M32 38 Q35 22 50 20 Q65 22 68 38 Q75 45 70 58 Q65 68 50 70 Q35 68 30 58 Q25 45 32 38 Z" fill="#FFFFFF" opacity="0.98" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-text-muted">Muddapappu</div>
            <div className="text-xs text-text-secondary">
              Best Deals in India
            </div>
          </div>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent-orange text-bg'
                    : 'text-text hover:bg-card-hover',
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Action buttons */}
        <div className="ml-auto flex items-center gap-2">
          {/* Store link */}
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-card-hover sm:inline-flex"
          >
            <span>🔍</span>
            <span>All Stores</span>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
            className="grid place-items-center rounded-lg p-2 text-text transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          >
            {light ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
            className="grid place-items-center rounded-lg p-2 text-text sm:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="border-t border-[var(--color-border)] bg-header px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  pathname === n.href ? 'bg-accent-orange text-bg' : 'text-text',
                )}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-wrap gap-2">
              {STORE_LIST.map((s) => (
                <span key={s.id} className="chip" style={{ borderColor: s.color + '55', color: s.color }}>
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