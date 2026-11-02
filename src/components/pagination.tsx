import Link from 'next/link';

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function Pagination({
  current,
  total,
  pageSize,
  href,
}: {
  current: number;
  total: number;
  pageSize: number;
  href: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);
  let window: number[];
  if (pages <= 5) window = range(1, pages);
  else if (current <= 3) window = range(1, 4);
  else if (current >= pages - 2) window = range(pages - 3, pages);
  else window = range(current - 1, current + 1);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={href(Math.max(1, current - 1))}
        aria-disabled={current === 1}
        className={cn(
          'rounded-lg px-3 py-1.5 text-sm',
          current === 1 ? 'pointer-events-none text-ink-600' : 'text-ink-300 hover:bg-ink-800',
        )}
      >
        ←
      </Link>
      {window.map((p) => (
        <Link
          key={p}
          href={href(p)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm',
            p === current ? 'bg-deal-500 text-white' : 'text-ink-300 hover:bg-ink-800',
          )}
        >
          {p}
        </Link>
      ))}
      <Link
        href={href(Math.min(pages, current + 1))}
        aria-disabled={current === pages}
        className={cn(
          'rounded-lg px-3 py-1.5 text-sm',
          current === pages ? 'pointer-events-none text-ink-600' : 'text-ink-300 hover:bg-ink-800',
        )}
      >
        →
      </Link>
    </nav>
  );
}