'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { STORE_LIST } from '@/lib/stores';
import type { DealResult, Coupon, StoreId } from '@/lib/types';

type AffiliateConfig = {
  [store in StoreId]: { tag: string; useCuelinks: boolean };
};

export function AdminClient() {
  const [tab, setTab] = useState<'deals' | 'coupons' | 'affiliates' | 'settings'>('deals');
  const [deals, setDeals] = useState<DealResult[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliateConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordMsg, setPasswordMsg] = useState('');

  async function load() {
    if (tab === 'settings' || (!tab || tab === '')) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (tab === 'deals' || tab === 'coupons') {
        const res = await fetch(`/api/deals?type=${tab}`);
        const json = await res.json();
        if (tab === 'deals') setDeals(json.deals ?? []);
        else if (tab === 'coupons') setCoupons(json.coupons ?? []);
      } else if (tab === 'affiliates') {
        const configRes = await fetch('/api/config');
        if (!configRes.ok) {
          throw new Error('Failed to fetch config');
        }
        const configJson = await configRes.json();
        setAffiliates(configJson.config ?? {});
      }
    } catch (e) {
      console.error('Failed to load data', e);
      setAffiliates({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  async function saveConfig() {
    if (!affiliates) return;
    setSaving(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: affiliates }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function updateTag(storeId: StoreId, tag: string) {
    if (!affiliates) return;
    const updated = { ...affiliates, [storeId]: { ...affiliates[storeId], tag } };
    setAffiliates(updated);
    await saveConfig();
  }

  async function toggleCuelinks(storeId: StoreId, useCuelinks: boolean) {
    if (!affiliates) return;
    const updated = { ...affiliates, [storeId]: { ...affiliates[storeId], useCuelinks } };
    setAffiliates(updated);
    await saveConfig();
  }

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
        <button
          onClick={() => setTab('settings')}
          className={cn('rounded-lg px-4 py-2 text-sm font-medium', tab === 'settings' ? 'bg-deal-500 text-white' : 'bg-ink-800 text-ink-200')}
        >
          Settings
        </button>
      </div>

      {tab === 'affiliates' && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-200">Store Affiliate Configuration</h3>
            {saving && <span className="text-xs text-ink-400">Saving...</span>}
          </div>
          {affiliates && (
            <div className="space-y-4">
              {STORE_LIST.map((store) => {
                const cfg = affiliates[store.id] || { tag: 'muddapappu', useCuelinks: true };
                return (
                  <div key={store.id} className="rounded-lg border border-ink-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full" style={{ background: store.color }} />
                        <div>
                          <div className="font-medium text-ink-100">{store.name}</div>
                          <div className="text-xs text-ink-500">{store.domain}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={cfg.useCuelinks}
                            onChange={(e) => toggleCuelinks(store.id, e.target.checked)}
                            className="h-4 w-4 rounded border-ink-600 bg-ink-800"
                          />
                          <span className="text-xs text-ink-300">Use Cuelinks</span>
                        </label>
                        {!cfg.useCuelinks && (
                          <input
                            type="text"
                            value={cfg.tag}
                            onChange={(e) => updateTag(store.id, e.target.value)}
                            className="w-24 rounded-md border border-ink-700 bg-ink-900 px-2 py-1 text-xs text-ink-100 focus:border-deal-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 rounded-lg bg-ink-900/40 p-4 text-xs text-ink-400">
            <p className="font-semibold text-ink-200 mb-1">How affiliate links are generated:</p>
            <ul className="list-inside list-disc space-y-1">
              <li><strong>Amazon:</strong> Uses your Amazon Associates tag (e.g., <code>{affiliates?.amazon?.tag || 'muddapappu-21'}-21</code>)</li>
              <li><strong>Flipkart/Myntra/Ajio:</strong> Requires Cuelinks membership for tracking links</li>
              <li><strong>Swiggy/Zomato/Zepto/BigBasket:</strong> Promo codes + app deep links via Cuelinks</li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="card p-6 max-w-2xl">
          <h3 className="mb-4 text-sm font-semibold text-ink-200">Admin Settings</h3>
          <div className="space-y-4">
            <div className="rounded-lg bg-ink-900/40 p-4">
              <h4 className="mb-2 text-sm font-medium text-ink-100">Change Admin Password</h4>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                  className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-deal-500"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm(f => ({ ...f, new: e.target.value }))}
                  className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-deal-500"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                  className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-deal-500"
                />
                <button
                  onClick={async () => {
                    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
                      setPasswordMsg('All fields are required');
                      return;
                    }
                    if (passwordForm.new !== passwordForm.confirm) {
                      setPasswordMsg('New passwords do not match');
                      return;
                    }
                    if (passwordForm.new.length < 6) {
                      setPasswordMsg('Password must be at least 6 characters');
                      return;
                    }
                    try {
                      const res = await fetch('/api/admin/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          current: passwordForm.current,
                          new: passwordForm.new
                        })
                      });
                      const json = await res.json();
                      if (json.ok) {
                        setPasswordMsg('Password changed successfully');
                        setPasswordForm({ current: '', new: '', confirm: '' });
                        setTimeout(() => setPasswordMsg(''), 3000);
                      } else {
                        setPasswordMsg(json.error || 'Failed to change password');
                      }
                    } catch {
                      setPasswordMsg('Failed to change password');
                    }
                  }}
                  className="btn-primary py-2 text-sm"
                >
                  Change Password
                </button>
                {passwordMsg && (
                  <p className="text-xs text-ink-300">{passwordMsg}</p>
                )}
              </div>
            </div>
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