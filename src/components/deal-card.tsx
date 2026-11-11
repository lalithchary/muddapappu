'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Heart } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPrice, StatusBadge, formatCountdown } from './status-badge';
import { StoreChip } from './store-chip';
import { Sparkline } from './sparkline';
import { CommentModal } from './comment-modal';
import { getOutboundUrl } from '@/lib/links';
import type { DealResult } from '@/lib/types';

export function DealCard({ deal, commentCount = 0 }: { deal: DealResult; commentCount?: number }) {
  const isExpired = deal.status === 'expired';
  const isEnding = deal.status === 'expiring';
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <article
        className={cn(
          'deal-card',
          isExpired && 'opacity-60',
          isEnding && 'ring-1 ring-amber-500/40',
        )}
      >
        {/* Header row - Status and discount badge */}
        <div className="flex items-start justify-between gap-2">
          {/* Store and Status */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <StoreChip store={deal.store} />
              <StatusBadge status={deal.status} />
            </div>
          </div>

          {/* Discount badge */}
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-accent-orange">{deal.discountPct}%</span>
            <span className="text-xs text-text-muted uppercase tracking-wide">off</span>
          </div>
        </div>

        {/* Product Image */}
        {deal.image ? (
          <div className="relative -mx-1 mb-2 overflow-hidden rounded-lg">
            <img
              src={deal.image}
              alt={deal.title}
              loading="lazy"
              className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105 bg-card"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.dataset.fallback !== '1') {
                  target.dataset.fallback = '1';
                  target.src = `https://via.placeholder.com/400x256/21262D/C9D1D9?text=${encodeURIComponent(deal.store)}`;
                }
              }}
            />
          </div>
        ) : (
          <div className="mb-2 flex h-32 items-center justify-center rounded-lg bg-card">
            <span className="text-xs text-text-muted">No image</span>
          </div>
        )}

        {/* Title */}
        <Link href={`/deal/${deal.slug}`} className="group">
          <h3
            className={cn(
              'line-clamp-2 text-sm font-semibold leading-snug text-text',
              isExpired && 'line-through text-text-muted',
            )}
          >
            {deal.title}
          </h3>
        </Link>

        {/* Price and Rating */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-bold text-text">{formatPrice(deal.price)}</span>
          <span
            className={cn(
              'text-xs line-through',
              isExpired ? 'text-text-muted' : 'text-text-secondary',
            )}
          >
            {formatPrice(deal.mrp)}
          </span>
          {deal.rating && (
            <span className="ml-auto text-xs text-text-muted">
              ★ {deal.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Price trend sparkline */}
        {deal.priceHistory && deal.priceHistory.length > 0 && (
          <Sparkline points={deal.priceHistory.map((p) => p.price)} current={deal.price} />
        )}

        {/* Expiring indicator */}
        {isEnding && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            Ends in {formatCountdown(deal.endsInSeconds)}
          </div>
        )}

        {/* Action row */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <a
            href={getOutboundUrl(deal)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={cn(
              'btn-primary flex-1 justify-center text-xs',
              'bg-accent-orange text-bg hover:bg-[color:oklch(70%_0.2_55)]',
              isExpired && 'pointer-events-none opacity-50',
            )}
          >
            {isExpired ? 'Expired' : 'View Deal'}
          </a>
          <button
            onClick={() => setShowComments(true)}
            aria-label="Comments"
            className="grid place-items-center rounded-lg border border-[var(--color-border)] p-2 text-text-muted transition-colors hover:border-[var(--color-border-2)] hover:bg-card-hover hover:text-text"
          >
            <MessageSquare className="h-4 w-4" />
            {commentCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-bg">
                {commentCount > 99 ? '99+' : commentCount}
              </span>
            )}
          </button>
          <button
            aria-label="Add to wishlist"
            className="grid place-items-center rounded-lg border border-[var(--color-border)] p-2 text-text-muted transition-colors hover:border-[var(--color-border-2)] hover:bg-card-hover hover:text-text"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </article>

      {showComments && (
        <CommentModal
          dealSlug={deal.slug}
          dealTitle={deal.title}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
}