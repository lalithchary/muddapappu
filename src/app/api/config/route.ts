import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import { ADMIN_PASSWORD } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'store', 'affiliate-config.json');

export async function GET() {
  const cookie = (await cookies()).get('admin_session');
  if (!cookie || cookie.value !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  try {
    const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
    return Response.json({ ok: true, config });
  } catch {
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
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(body.config, null, 2));
  return Response.json({ ok: true });
}
