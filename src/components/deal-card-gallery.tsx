'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Heart } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPrice, StatusBadge } from './status-badge';
import { StoreChip } from './store-chip';
import { CommentModal } from './comment-modal';
import type { DealResult } from '@/lib/types';

export function DealCardGallery({ deal, commentCount = 0 }: { deal: DealResult; commentCount?: number }) {
  const isExpired = deal.status === 'expired';
  const isEnding = deal.status === 'expiring';
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <article className="deal-card-gallery flex flex-col">
        {/* Image is the main content in gallery mode */}
        {deal.image ? (
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <img
              src={deal.image}
              alt={deal.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.dataset.fallback !== '1') {
                  target.dataset.fallback = '1';
                  target.src = `https://via.placeholder.com/400x256/161B22/C9D1D9?text=${encodeURIComponent(deal.store)}`;
                }
              }}
            />
            {/* Overlay badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <StoreChip store={deal.store} size="sm" />
              <StatusBadge status={deal.status} />
            </div>
            {/* Discount badge */}
            <div className="absolute top-2 right-2 rounded-full bg-accent-orange px-2 py-1 text-xs font-bold text-bg">
              {deal.discountPct}% OFF
            </div>
          </div>
        ) : (
          <div className="mb-2 flex h-32 items-center justify-center rounded-lg bg-card">
            <span className="text-xs text-text-muted">No image</span>
          </div>
        )}

        {/* Title */}
        <Link href={`/deal/${deal.slug}`} className="block px-2 pt-2">
          <h3 className="line-clamp-1 text-xs font-semibold text-text">
            {deal.title}
          </h3>
        </Link>

        {/* Price row */}
        <div className="flex items-center gap-1.5 px-2 pb-2 text-xs">
          <span className="font-bold text-accent-orange">{formatPrice(deal.price)}</span>
          {isExpired && (
            <span className="text-text-muted line-through text-xs">{formatPrice(deal.mrp)}</span>
          )}
          {/* Comment button with count */}
          <button
            onClick={() => setShowComments(true)}
            aria-label="Comments"
            className="ml-auto grid place-items-center rounded-full p-1 text-text-muted transition-colors hover:bg-card hover:text-text"
          >
            <MessageSquare className="h-4 w-4" />
            {commentCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-bg">
                {commentCount > 99 ? '99+' : commentCount}
              </span>
            )}
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