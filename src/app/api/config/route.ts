import { cookies } from 'next/headers';
import { ADMIN_PASSWORD } from '@/lib/admin-auth';
import { loadAffiliateConfig } from '@/lib/affiliate-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookie = (await cookies()).get('admin_session');
  if (!cookie || cookie.value !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  
  try {
    const config = await loadAffiliateConfig();
    return Response.json({ ok: true, config });
  } catch (error) {
    console.error('Failed to load config:', error);
    return Response.json({ ok: true, config: {} });
  }
}

export async function POST(request: Request) {
  const cookie = (await cookies()).get('admin_session');
  if (!cookie || cookie.value !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  if (!body.config) {
    return Response.json({ ok: false, error: 'missing config' }, { status: 400 });
  }

  try {
    const { saveAffiliateConfig } = await import('@/lib/affiliate-store');
    await saveAffiliateConfig(body.config);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Failed to save config:', error);
    return Response.json({ ok: false, error: 'Failed to save config' }, { status: 500 });
  }
}