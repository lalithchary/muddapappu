import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ADMIN_PASSWORD } from '@/lib/admin-auth';

export default async function AdminLogin() {
  const cookie = (await cookies()).get('admin_session');
  const isValid = cookie && cookie.value === ADMIN_PASSWORD;
  if (isValid) {
    redirect('/admin');
  }

  async function loginAction(formData: FormData): Promise<void> {
    'use server';
    const password = String(formData.get('password') || '');
    const expected = ADMIN_PASSWORD;
    if (expected && password === expected) {
      const { cookies } = await import('next/headers');
      (await cookies()).set('admin_session', expected, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      redirect('/admin');
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-4">
      <h1 className="font-display text-2xl font-bold">Admin login</h1>
      <p className="mt-1 text-sm text-ink-400">Manage deals & coupons.</p>
      <form action={loginAction} className="mt-6 space-y-3">
        <input
          name="password"
          type="password"
          placeholder="Admin password"
          className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-100 focus:border-deal-500 focus:outline-none"
        />
        <button type="submit" className="btn-primary w-full">Sign in</button>
      </form>
      <p className="mt-3 text-xs text-ink-600">
        Password is set in <code>.env.local</code> as <code>ADMIN_PASSWORD</code>.
      </p>
    </div>
  );
}