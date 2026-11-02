import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_PASSWORD } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const cookie = (await cookies()).get('admin_session');
  if (!cookie || cookie.value !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  (await cookies()).delete('admin_session');
  return Response.json({ ok: true });
}