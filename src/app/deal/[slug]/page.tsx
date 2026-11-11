import { notFound } from 'next/navigation';
import Link from 'next/link';
import { repo } from '@/lib/repo-instance';
import { applyQuery } from '@/lib/repo';
import { formatPrice, StatusBadge, formatCountdown } from '@/components/status-badge';
import { StoreChip } from '@/components/store-chip';
import { cn } from '@/lib/cn';
import { Sparkline } from '@/components/sparkline';
import { getOutboundUrl } from '@/lib/links';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deal = await repo().getDeal(slug);
  if (!deal) return { title: 'Deal not found — SastaDeal' };
  return {
    title: `${deal.title} — Deal on ${deal.store} | SastaDeal`,
    description: `${formatPrice(deal.price)} (was ${formatPrice(deal.mrp)}) — ${deal.discountPct}% off. ${deal.status === 'expired' ? 'Deal has ended.' : 'Live deal.'}`,
  };
}

export default async function DealPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deal = await repo().getDeal(slug);
  if (!deal) notFound();

  const isExpired = deal.status === 'expired';
  const isEnding = deal.status === 'expiring';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-ink-400 hover:text-white">← Back to deals</Link>

      <article className="card mt-4 overflow-hidden">
        <div className="relative aspect-video w-full overflow-hidden bg-ink-800">
          <img
            src={deal.image}
            alt={deal.title}
            className="h-full w-full object-contain"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            <StoreChip store={deal.store} size="md" />
            <StatusBadge status={deal.status} />
          </div>
          <div className="absolute right-3 top-3 rounded-xl bg-ink-950/80 px-3 py-1.5 backdrop-blur">
            <span className="text-base font-bold text-deal-500">{deal.discountPct}%</span>
            <span className="ml-1 text-[10px] text-ink-300">OFF</span>
          </div>
        </div>

        <div className="p-5">
          <h1 className={cn('font-display text-xl font-bold leading-snug', isExpired && 'line-through text-ink-400')}>
            {deal.title}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-bold text-white">{formatPrice(deal.price)}</span>
            <span className={cn('text-base', isExpired ? 'text-ink-500 line-through' : 'text-ink-400 line-through')}>
              {formatPrice(deal.mrp)}
            </span>
            <span className="ml-auto text-sm text-ink-400">Save {formatPrice(deal.mrp - deal.price)}</span>
          </div>

          <Sparkline points={deal.priceHistory.map((p) => p.price)} current={deal.price} />

          {deal.description && (
            <p className="mt-4 whitespace-pre-line text-sm text-ink-300">{deal.description}</p>
          )}

          {isEnding && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              Deal ends in {formatCountdown(deal.endsInSeconds)}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href={getOutboundUrl(deal)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={cn(
                'btn-primary flex-1',
                isExpired && 'pointer-events-none opacity-50',
              )}
            >
              {isExpired ? 'Deal Expired' : 'View Deal on ' + deal.store.charAt(0).toUpperCase() + deal.store.slice(1)}
            </a>
            <button className="btn-ghost flex-1">Add to wishlist</button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-500">
            <span>Verified {new Date(deal.verifiedAt).toLocaleString('en-IN')}</span>
            <span>•</span>
            <span>Source: {deal.source}</span>
            {deal.rating && (
              <>
                <span>•</span>
                <span>★ {deal.rating} ({deal.ratingsCount} ratings)</span>
              </>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}