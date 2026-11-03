import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_PASSWORD } from '@/lib/admin-auth';
import { AdminClient } from '@/components/admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookie = (await cookies()).get('admin_session');
  const isValid = cookie && cookie.value === ADMIN_PASSWORD;
  if (!isValid) {
    redirect('/admin/login');
  }
  return <AdminClient />;
}