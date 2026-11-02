import { cn } from '@/lib/cn';

export function FilterBarPlaceholder() {
  return (
    <div className="space-y-3">
      <div className="h-11 w-full animate-pulse rounded-xl bg-ink-800/60" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-ink-800/60" />
        ))}
      </div>
    </div>
  );
}