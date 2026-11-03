import Link from 'next/link';
import { repo } from '@/lib/repo-instance';
import { applyQuery } from '@/lib/repo';
import type { DealQuery } from '@/lib/types';
import { CATEGORIES, STORES } from '@/lib/stores';

export default async function CategoriesPage() {
  const all = await repo().listDeals();
  const activeByCat: Record<string, number> = {};
  for (const d of all) {
    if (d.status === 'expired') continue;
    activeByCat[d.category] = (activeByCat[d.category] ?? 0) + 1;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">
          Browse by <span className="text-accent-orange">Category</span>
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Filter deals by category, store, or deal type.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const count = activeByCat[c.id] ?? 0;
          return (
            <Link
              key={c.id}
              href={`/?cat=${c.id}`}
              className="deal-card group hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="grid place-items-center rounded-xl bg-card-hover p-3 text-2xl">
                  {c.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text">{c.label}</h3>
                  <p className="text-xs text-text-muted">
                    {count} active deal{count === 1 ? '' : 's'} • {c.stores.length} store{c.stores.length === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="text-text-muted transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-sm font-semibold text-text uppercase tracking-wider">Shop by store</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Object.values(STORES).map((s) => (
            <Link
              key={s.id}
              href={`/?store=${s.id}`}
              className="card flex items-center gap-3 p-3 text-sm transition-all hover:shadow-sm"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: s.color }}
              />
              <div>
                <div className="font-medium text-text">{s.shortName}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}