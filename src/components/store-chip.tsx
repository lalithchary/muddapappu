import { cn } from '@/lib/cn';
import { storeInfo } from '@/lib/stores';
import type { StoreId } from '@/lib/types';

export function StoreChip({ store, size = 'sm' }: { store: StoreId; size?: 'sm' | 'md' }) {
  const s = storeInfo(store);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
      )}
      style={{ borderColor: s.color + '55', color: s.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: s.color }}
      />
      {s.shortName}
    </span>
  );
}