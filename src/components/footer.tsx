import Link from 'next/link';
import { Logo } from '@/components/logo';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-header">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 font-display text-xl font-bold">
              <Logo />
              <span>
                Mudda<span className="text-accent-orange">pappu</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-text-muted">
              India&apos;s best deals aggregator. Real-time price tracking across Amazon, Flipkart,
              Myntra, Ajio and food delivery apps.
            </p>
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
      </div>
    </footer>
  );
}