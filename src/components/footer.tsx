import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-header">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
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