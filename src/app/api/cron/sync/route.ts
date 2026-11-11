import { NextResponse } from 'next/server';
import { syncAmazonDeals } from '@/lib/amazon-sync';

export const dynamic = 'force-dynamic';

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  if (process.env.NODE_ENV !== 'production') return true;

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    console.log('[api/cron/sync] Deal sync triggered...', body);

    const amazonRes = await syncAmazonDeals();

    return NextResponse.json({
      ok: true,
      message: 'Deal sync finished',
      amazon: amazonRes,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[api/cron/sync] Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const amazonRes = await syncAmazonDeals();
    return NextResponse.json({
      ok: true,
      message: 'Muddapappu deal sync executed via GET',
      amazon: amazonRes,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
