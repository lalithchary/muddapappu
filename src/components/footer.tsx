import Link from 'next/link';
import { STORE_LIST } from '@/lib/stores';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-header">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 font-display text-xl font-bold">
              <div className="h-8 w-8 rounded-lg bg-accent-orange flex items-center justify-center">
                <span className="text-xs font-mono text-bg">M</span>
              </div>
              <span>
                Mudda<span className="text-accent-orange">pappu</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-text-muted">
              India&apos;s best deals aggregator. Real-time price tracking across Amazon, Flipkart,
              Myntra, Ajio and food delivery apps.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-text">Browse</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/" className="hover:text-text hover:underline">
                  Deals
                </Link>
              </li>
              <li>
                <Link href="/coupons" className="hover:text-text hover:underline">
                  Coupons
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-text hover:underline">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Stores */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-text">Stores</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              {STORE_LIST.map((s) => (
                <li key={s.id}>
                  <Link href={`/?store=${s.id}`} className="hover:text-text hover:underline">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-text">About</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/about" className="hover:text-text hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-text hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-text hover:underline">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--color-border)] pt-6 text-xs text-text-muted">
          <p>
            © {new Date().getFullYear()} Muddapappu. Affiliate links may earn us a commission. Built
            for Indian shoppers.
          </p>
        </div>
      </div>
    </footer>
  );
}