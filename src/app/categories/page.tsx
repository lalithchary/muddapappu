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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Browse by <span className="text-deal-500">Category</span>
        </h1>
        <p className="mt-1 text-sm text-ink-400">
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
              className="card flex items-center gap-4 p-5 transition-colors hover:border-ink-700"
            >
              <div className="grid place-items-center rounded-2xl bg-ink-800 p-3 text-2xl">
                {c.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{c.label}</h3>
                <p className="text-xs text-ink-400">
                  {count} active deal{count === 1 ? '' : 's'} • {c.stores.length} store{c.stores.length === 1 ? '' : 's'}
                </p>
              </div>
              <span className="text-ink-500">→</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-ink-100">Shop by store</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.values(STORES).map((s) => (
            <Link
              key={s.id}
              href={`/?store=${s.id}`}
              className="card flex items-center gap-3 p-4 transition-colors hover:border-ink-700"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: s.color }}
              />
              <div>
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="text-[10px] text-ink-500">{s.category}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}