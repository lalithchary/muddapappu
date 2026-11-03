import { cookies } from 'next/headers';
import { repo } from '@/lib/repo-instance';
import { applyQuery } from '@/lib/repo';
import { ADMIN_PASSWORD } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cookie = (await cookies()).get('admin_session');
  if (!cookie || cookie.value !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const url = new URL(request.url);
  const type = url.searchParams.get('type') ?? 'deals';
  if (type === 'coupons') {
    return Response.json({ ok: true, coupons: await repo().listCoupons() });
  }
  const all = await repo().listDeals();
  return Response.json({ ok: true, deals: all });
}

export async function POST(request: Request) {
  const cookie = (await cookies()).get('admin_session');
  if (!cookie || cookie.value !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const type = body.type;
  if (type === 'deal') {
    await repo().saveDeal(body.deal);
    return Response.json({ ok: true, id: body.deal.id });
  }
  if (type === 'coupon') {
    await repo().saveCoupon(body.coupon);
    return Response.json({ ok: true, id: body.coupon.id });
  }
  if (type === 'affiliates') {
    const fs = await import('fs/promises');
    const path = await import('path');
    const configPath = path.join(process.cwd(), 'data', 'store', 'affiliate-config.json');
    await fs.writeFile(configPath, JSON.stringify(body.data, null, 2));
    return Response.json({ ok: true });
  }
  return Response.json({ ok: false, error: 'unknown type' }, { status: 400 });
}

export async function DELETE(request: Request) {
  const cookie = (await cookies()).get('admin_session');
  if (!cookie || cookie.value !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const id = url.searchParams.get('id');
  if (!id) return Response.json({ ok: false, error: 'missing id' }, { status: 400 });
  if (type === 'deal') await repo().deleteDeal(id);
  else if (type === 'coupon') await repo().deleteCoupon(id);
  else return Response.json({ ok: false, error: 'unknown type' }, { status: 400 });
  return Response.json({ ok: true });
}