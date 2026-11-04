'use client';

import Link from 'next/link';
import { STORES } from '@/lib/stores';
import type { StoreId } from '@/lib/types';

export function StoreList({ stores }: { stores: StoreId[] }) {
  if (!stores || stores.length === 0) return null;

  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
        Store:
      </h4>
      <div className="flex flex-wrap gap-2">
        {stores.map((storeId) => {
          const s = STORES[storeId];
          if (!s) return null;
          return (
            <Link
              key={storeId}
              href={`/?store=${storeId}`}
              className="store-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: s.color + '20',
                borderColor: s.color + '55',
                color: s.color,
              }}
            >
              {s.shortName}
            </Link>
          );
        })}
      </div>
    </div>
  );
}