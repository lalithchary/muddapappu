import { notFound } from 'next/navigation';
import Link from 'next/link';
import { repo } from '@/lib/repo-instance';
import { formatPrice, StatusBadge, formatCountdown } from '@/components/status-badge';
import { StoreChip } from '@/components/store-chip';
import { cn } from '@/lib/cn';
import { Sparkline } from '@/components/sparkline';
import { getOutboundUrl } from '@/lib/links';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deal = await repo().getDeal(slug);
  if (!deal) return { title: 'Deal not found — Muddapappu' };
  const storeName = deal.store ? deal.store.charAt(0).toUpperCase() + deal.store.slice(1) : 'Store';
  const discount = deal.discountPct ?? (deal.mrp ? Math.round(((deal.mrp - deal.price) / deal.mrp) * 100) : 0);
  return {
    title: `${deal.title} — Deal on ${storeName} | Muddapappu`,
    description: `${formatPrice(deal.price)} (was ${formatPrice(deal.mrp)}) — ${discount}% off. ${deal.status === 'expired' ? 'Deal has ended.' : 'Live deal.'}`,
  };
}

export default async function DealPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deal = await repo().getDeal(slug);
  if (!deal) notFound();

  const isExpired = deal.status === 'expired';
  const isEnding = deal.status === 'expiring';
  const storeName = deal.store ? deal.store.charAt(0).toUpperCase() + deal.store.slice(1) : 'Store';

  const verifiedDate = deal.verifiedAt ? new Date(deal.verifiedAt) : new Date();
  const verifiedFormatted = !isNaN(verifiedDate.getTime()) ? verifiedDate.toLocaleDateString('en-IN') : 'Recently';

  const discount = deal.discountPct ?? (deal.mrp ? Math.round(((deal.mrp - deal.price) / deal.mrp) * 100) : 0);
  const savings = Math.max(0, (deal.mrp || deal.price) - deal.price);

  const priceHistory = Array.isArray(deal.priceHistory) && deal.priceHistory.length > 0
    ? deal.priceHistory
    : [{ date: new Date().toISOString().slice(0, 10), price: deal.price }];
  const hasSparkline = priceHistory.length > 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-text-muted hover:text-white transition-colors">
        ← Back to deals
      </Link>

      <article className="card mt-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-card p-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-ink-850">
          <img
            src={deal.image || '/placeholder.png'}
            alt={deal.title}
            className="h-full w-full object-contain"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            <StoreChip store={deal.store} size="md" />
            <StatusBadge status={deal.status || 'active'} />
          </div>
          <div className="absolute right-3 top-3 rounded-xl bg-black/80 px-3 py-1.5 backdrop-blur">
            <span className="text-base font-bold text-accent-orange">{discount}%</span>
            <span className="ml-1 text-[10px] text-text-muted">OFF</span>
          </div>
        </div>

        <div className="pt-6">
          <h1 className={cn('font-display text-xl sm:text-2xl font-bold leading-snug', isExpired && 'line-through text-text-muted')}>
            {deal.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-white">{formatPrice(deal.price)}</span>
            <span className={cn('text-lg', isExpired ? 'text-text-muted line-through' : 'text-text-secondary line-through')}>
              {formatPrice(deal.mrp)}
            </span>
            {savings > 0 && (
              <span className="ml-auto text-sm text-accent-orange font-semibold">
                Save {formatPrice(savings)}
              </span>
            )}
          </div>

          {hasSparkline && (
            <div className="mt-2">
              <Sparkline points={priceHistory.map((p) => p.price)} current={deal.price} />
            </div>
          )}

          {deal.description && (
            <p className="mt-4 whitespace-pre-line text-sm text-text-secondary leading-relaxed border-t border-[var(--color-border)] pt-4">
              {deal.description}
            </p>
          )}

          {isEnding && typeof deal.endsInSeconds === 'number' && deal.endsInSeconds > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              Deal ends in {formatCountdown(deal.endsInSeconds)}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={getOutboundUrl(deal)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={cn(
                'btn-primary flex-1 justify-center py-3 text-sm font-semibold rounded-xl text-center',
                'bg-accent-orange text-bg hover:bg-[color:oklch(70%_0.2_55)] transition-colors',
                isExpired && 'pointer-events-none opacity-50',
              )}
            >
              {isExpired ? 'Deal Expired' : `View Deal on ${storeName}`}
            </a>
            <Link
              href="/"
              className="btn-ghost flex-1 justify-center py-3 text-sm font-medium rounded-xl border border-[var(--color-border)] text-center hover:bg-card-hover transition-colors"
            >
              Explore More Deals
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-4 text-xs text-text-muted">
            <span>Verified: {verifiedFormatted}</span>
            <span>•</span>
            <span>Store: {storeName}</span>
            {deal.category && (
              <>
                <span>•</span>
                <span>Category: {deal.category}</span>
              </>
            )}
            {deal.rating && (
              <>
                <span>•</span>
                <span className="text-amber-400">★ {deal.rating} {deal.ratingsCount ? `(${deal.ratingsCount} ratings)` : ''}</span>
              </>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
