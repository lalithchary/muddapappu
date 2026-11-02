import Link from 'next/link';
import { STORE_LIST } from '@/lib/stores';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-800 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="grid place-items-center rounded-lg bg-deal-500/15 p-1.5 text-deal-500">
                <span className="h-4 w-4 rounded-sm bg-deal-500" />
              </span>
              Mudda<span className="text-deal-500">pappu</span>
            </Link>
            <p className="mt-3 text-sm text-ink-400">
              India's best deals aggregator. Real-time price tracking across Amazon, Flipkart, Myntra, Ajio
              and food delivery apps.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-100">Browse</h4>
            <ul className="space-y-2 text-sm text-ink-400">
              <li><Link href="/" className="hover:text-white">Deals</Link></li>
              <li><Link href="/coupons" className="hover:text-white">Coupons</Link></li>
              <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-100">Stores</h4>
            <ul className="space-y-2 text-sm text-ink-400">
              {STORE_LIST.map((s) => (
                <li key={s.id}>
                  <Link href={`/?store=${s.id}`} className="hover:text-white">{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-100">About</h4>
            <ul className="space-y-2 text-sm text-ink-400">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink-800 pt-6 text-xs text-ink-500">
          <span>© {new Date().getFullYear()} Muddapappu. Affiliate links may earn us a commission.</span>
          <span className="text-ink-600">Built for Indian shoppers.</span>
        </div>
      </div>
    </footer>
  );
}