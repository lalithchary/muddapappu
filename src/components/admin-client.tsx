'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { STORE_LIST } from '@/lib/stores';
import type { DealResult, Coupon, StoreId } from '@/lib/types';

/** Affiliate tracking configuration for each store */
const AFFILIATE_CONFIG: Record<StoreId, { tag: string; useCuelinks: boolean }> = {
  amazon: { tag: 'muddapappu-21', useCuelinks: false },
  flipkart: { tag: 'muddapappu', useCuelinks: true }, // Use Cuelinks shortlink
  myntra: { tag: 'muddapappu', useCuelinks: true },
  ajio: { tag: 'muddapappu', useCuelinks: true },
  swiggy: { tag: 'muddapappu', useCuelinks: true },
  zomato: { tag: 'muddapappu', useCuelinks: true },
  zepto: { tag: 'muddapappu', useCuelinks: true },
  bigbasket: { tag: 'muddapappu', useCuelinks: true },
};

export function AdminClient() {
  const [tab, setTab] = useState<'deals' | 'coupons' | 'affiliates'>('deals');
  const [deals, setDeals] = useState<DealResult[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/deals?type=${tab}`);
    const json = await res.json();
    if (tab === 'deals') setDeals(json.deals ?? []);
    else setCoupons(json.coupons ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  async function remove(id: string) {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/deals?type=${tab}&id=${id}`, { method: 'DELETE' });
    load();
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
        <div className="flex items-center gap-2">
          <Link href="/" className="btn-ghost py-2 text-xs">View site</Link>
          <button onClick={logout} className="btn-ghost py-2 text-xs">Logout</button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab('deals')}
          className={cn('rounded-lg px-4 py-2 text-sm font-medium', tab === 'deals' ? 'bg-deal-500 text-white' : 'bg-ink-800 text-ink-200')}
        >
          Deals ({deals.length})
        </button>
        <button
          onClick={() => setTab('coupons')}
          className={cn('rounded-lg px-4 py-2 text-sm font-medium', tab === 'coupons' ? 'bg-deal-500 text-white' : 'bg-ink-800 text-ink-200')}
        >
          Coupons ({coupons.length})
        </button>
        <button
          onClick={() => setTab('affiliates')}
          className={cn('rounded-lg px-4 py-2 text-sm font-medium', tab === 'affiliates' ? 'bg-deal-500 text-white' : 'bg-ink-800 text-ink-200')}
        >
          Affiliate Links
        </button>
      </div>

      {tab === 'affiliates' && (
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold text-ink-200">Store Affiliate Configuration</h3>
          <dl className="divide-y divide-ink-800">
            {STORE_LIST.map((store) => {
              const cfg = AFFILIATE_CONFIG[store.id];
              return (
                <div key={store.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full" style={{ background: store.color }} />
                    <dt className="text-sm font-medium text-ink-100">{store.name}</dt>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-ink-300">
                      {cfg.useCuelinks ? 'Cuelinks Shortlink' : `Amazon Tag: ${cfg.tag}-21`}
                    </div>
                    <code className="text-xs text-ink-500">{store.domain}</code>
                  </div>
                </div>
              );
            })}
          </dl>
          <div className="mt-4 rounded-lg bg-ink-900/40 p-4 text-xs text-ink-400">
            <p className="font-semibold text-ink-200 mb-1">How affiliate links are generated:</p>
            <ul className="list-inside list-disc space-y-1">
              <li><strong>Amazon:</strong> Uses your Amazon Associates tag with the product ASIN</li>
              <li><strong>Flipkart/Myntra/Jio/Ajio:</strong> Requires Cuelinks membership for tracking links</li>
              <li><strong>Swiggy/Zomato/Zepto:</strong> Promo codes + app deep links via Cuelinks</li>
            </ul>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-ink-400">Loading…</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/60 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Store</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">MRP</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {tab === 'deals'
                ? deals.map((d) => (
                    <tr key={d.id} className="hover:bg-ink-900/40">
                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate font-medium">{d.title}</div>
                        <div className="text-xs text-ink-500">{d.brand} • {d.category}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StoreChip store={d.store} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">₹{d.price}</td>
                      <td className="px-4 py-3 text-right text-ink-400 line-through">₹{d.mrp}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('status-badge', d.status === 'expired' ? 'status-expired' : d.status === 'expiring' ? 'status-expiring' : 'status-active')}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/deal/${d.slug}`} className="text-xs text-deal-500 hover:underline">View</Link>
                        <button onClick={() => remove(d.id)} className="ml-3 text-xs text-red-400 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))
                : coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-ink-900/40">
                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate font-medium">{c.title}</div>
                        <div className="text-xs text-ink-500">{c.code}</div>
                      </td>
                      <td className="px-4 py-3"><StoreChip store={c.store} /></td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {c.valueType === 'percent' ? `${c.value}%` : `₹${c.value}`}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-400">—</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('status-badge', c.active ? 'status-active' : 'status-expired')}>
                          {c.active ? 'Live' : 'Expired'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => remove(c.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {(tab === 'deals' ? deals.length : coupons.length) === 0 && (
            <div className="p-8 text-center text-ink-500">No {tab} yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

function StoreChip({ store }: { store: StoreId }) {
  const s = STORE_LIST.find((x) => x.id === store);
  if (!s) return <span className="text-xs text-ink-500">{store}</span>;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: s.color + '55', color: s.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.shortName}
    </span>
  );
}