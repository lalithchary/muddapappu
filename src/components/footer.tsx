import Link from 'next/link';
import { STORE_LIST } from '@/lib/stores';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-800 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="grid place-items-center rounded-lg bg-deal-600/15 p-1.5 text-deal-600">
                <span className="h-4 w-4 rounded-sm bg-deal-600" />
              </span>
              Mudda<span className="text-deal-600">pappu</span>
            </Link>
            <p className="mt-3 text-sm text-ink-600">
              India&apos;s best deals aggregator. Real-time price tracking across Amazon, Flipkart,
              Myntra, Ajio and food delivery apps.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-100">Browse</h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li>
                <Link href="/" className="hover:text-ink-100 hover:underline">
                  Deals
                </Link>
              </li>
              <li>
                <Link href="/coupons" className="hover:text-ink-100 hover:underline">
                  Coupons
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-ink-100 hover:underline">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-100">Stores</h4>
            <ul className="space-y-2 text-sm text-ink-600">
              {STORE_LIST.map((s) => (
                <li key={s.id}>
                  <Link href={`/?store=${s.id}`} className="hover:text-ink-100 hover:underline">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink-100">About</h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li>
                <Link href="/about" className="hover:text-ink-100 hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-ink-100 hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-ink-100 hover:underline">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-ink-800 pt-6 text-xs text-ink-600">
          <span>
            © {new Date().getFullYear()} Muddapappu. Affiliate links may earn us a commission.
          </span>
          <span>Built for Indian shoppers.</span>
        </div>
      </div>
    </footer>
  );
}