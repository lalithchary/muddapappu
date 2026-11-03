'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPrice, StatusBadge, formatCountdown } from './status-badge';
import { StoreChip } from './store-chip';
import { Sparkline } from './sparkline';
import { CommentModal } from './comment-modal';
import type { DealResult } from '@/lib/types';

export function DealCard({ deal, commentCount = 0 }: { deal: DealResult; commentCount?: number }) {
  const isExpired = deal.status === 'expired';
  const isEnding = deal.status === 'expiring';
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <article
        className={cn(
          'deal-card relative',
          isExpired && 'opacity-60',
          isEnding && 'ring-1 ring-amber-500/40',
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <StoreChip store={deal.store} />
              <StatusBadge status={deal.status} />
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-bold text-deal-600">{deal.discountPct}%</span>
            <span className="text-[10px] text-ink-600 uppercase tracking-wider">off</span>
          </div>
        </div>

        {/* Product Image */}
        {deal.image ? (
          <div className="relative -mx-1 mb-2 overflow-hidden rounded-lg">
            <img
              src={deal.image}
              alt={deal.title}
              loading="lazy"
              className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105 bg-ink-800"
              onError={(e) => {
                // Fallback to store-based placeholder on error
                const target = e.target as HTMLImageElement;
                if (target.dataset.fallback !== '1') {
                  target.dataset.fallback = '1';
                  target.src = `https://via.placeholder.com/400x256/1C1C21/E8E8EC?text=${encodeURIComponent(deal.store)}`;
                }
              }}
            />
          </div>
        ) : (
          <div className="mb-2 flex h-32 items-center justify-center rounded-lg bg-ink-900">
            <span className="text-xs text-ink-600">No image available</span>
          </div>
        )}

        {/* Title */}
        <Link href={`/deal/${deal.slug}`} className="group">
          <h3
            className={cn(
              'line-clamp-2 text-sm font-semibold leading-snug',
              isExpired && 'line-through text-ink-600',
            )}
          >
            {deal.title}
          </h3>
        </Link>

        {/* Price row */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-bold text-ink-100">{formatPrice(deal.price)}</span>
          <span
            className={cn(
              'text-xs',
              isExpired ? 'text-ink-600 line-through' : 'text-ink-500 line-through',
            )}
          >
            {formatPrice(deal.mrp)}
          </span>
          {deal.rating && (
            <span className="ml-auto text-xs text-ink-600">
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
            href={deal.networkLink || deal.affiliateUrl || deal.productUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={cn(
              'btn-primary flex-1 py-2 text-xs',
              isExpired && 'pointer-events-none opacity-50',
            )}
          >
            {isExpired ? 'Expired' : 'View Deal'}
          </a>
          <button
            onClick={() => setShowComments(true)}
            aria-label="Comments"
            className="relative grid place-items-center rounded-lg border border-ink-700 p-2 text-ink-500 transition-colors hover:border-ink-600 hover:bg-ink-900 hover:text-ink-100"
          >
            <MessageSquare className="h-4 w-4" />
            {commentCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-deal-600 px-1 text-[10px] font-bold text-white">
                {commentCount > 99 ? '99+' : commentCount}
              </span>
            )}
          </button>
          <button
            aria-label="Add to wishlist"
            className="grid place-items-center rounded-lg border border-ink-700 p-2 text-ink-500 transition-colors hover:border-ink-600 hover:bg-ink-900 hover:text-ink-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 12.5 6 5.5 5.5 0 0 0 6 8.5c0 2.3 1.5 4.05 3 5.5l6 6z" />
            </svg>
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