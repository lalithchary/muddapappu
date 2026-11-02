import { notFound } from 'next/navigation';
import { repo } from '@/lib/repo-instance';
import { formatPrice } from '@/components/status-badge';
import { StoreChip } from '@/components/store-chip';
import { CopyButton } from '@/components/copy-button';
import { STORES } from '@/lib/stores';

export default async function CouponsPage() {
  const coupons = await repo().listCoupons();
  const now = new Date();
  const active = coupons.filter((c) => c.active && new Date(c.expiresAt) > now);
  const expired = coupons.filter((c) => !c.active || new Date(c.expiresAt) <= now);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Active <span className="text-deal-500">Coupons</span>
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Verified promo codes for Amazon, Flipkart, Myntra, Ajio & food delivery apps.
        </p>
      </div>

      {active.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <div className="grid place-items-center rounded-2xl bg-ink-800 p-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="text-ink-400"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M6 12h.01M6 16h.01M10 8h8M10 12h5"/></svg>
          </div>
          <p className="text-sm text-ink-400">No active coupons right now. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((c) => (
            <article key={c.id} className="card flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <StoreChip store={c.store} size="md" />
                <span className="status-badge status-active">Live</span>
              </div>
              <h3 className="text-sm font-semibold leading-snug">{c.title}</h3>
              {c.description && <p className="text-xs text-ink-400">{c.description}</p>}
              <div className="mt-auto flex items-center justify-between gap-2">
                <div>
                  <span className="text-lg font-bold text-deal-500">
                    {c.valueType === 'percent' ? `${c.value}%` : `₹${c.value}`}
                  </span>
                  <span className="ml-1 text-[10px] text-ink-500">OFF</span>
                  {c.minOrder > 0 && (
                    <div className="text-[10px] text-ink-500">Min ₹{c.minOrder}</div>
                  )}
                </div>
                <CopyButton code={c.code} ctaUrl={c.ctaUrl} />
              </div>
            </article>
          ))}
        </div>
      )}

      {expired.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-ink-500">Expired</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {expired.map((c) => (
              <article key={c.id} className="card flex flex-col gap-2 p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <StoreChip store={c.store} size="sm" />
                  <span className="status-badge status-expired">Expired</span>
                </div>
                <h3 className="text-sm font-medium leading-snug line-through text-ink-400">{c.title}</h3>
                <div className="text-sm font-bold text-ink-500">
                  {c.valueType === 'percent' ? `${c.value}%` : `₹${c.value}`}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}