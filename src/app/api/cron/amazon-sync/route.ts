import { NextResponse } from 'next/server';
import { syncAmazonDeals } from '@/lib/amazon-sync';

export const dynamic = 'force-dynamic';

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'muddapappu-secret';

  // Allow in development or if bearer token matches
  if (process.env.NODE_ENV !== 'production') return true;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const tag = body.tag || process.env.AMAZON_TAG;
    console.log('[api/cron/amazon-sync] Triggered sync...', body);

    const result = await syncAmazonDeals(tag);

    return NextResponse.json({
      ok: true,
      synced: result.synced,
      updated: result.updated,
      totalDeals: result.deals.length,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[api/cron/amazon-sync] Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Support GET for simple monitoring or cron triggers
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncAmazonDeals();
    return NextResponse.json({
      ok: true,
      message: 'Amazon deal sync executed successfully via GET trigger',
      synced: result.synced,
      updated: result.updated,
      totalDeals: result.deals.length,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
