import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import { ADMIN_PASSWORD } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const CONFIG_PATH = path.join(process.cwd(), '.env.local');

export async function POST(request: Request) {
  const cookie = (await cookies()).get('admin_session');
  if (!cookie || cookie.value !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const { current, new: newPassword } = body;
  
  if (!current || !newPassword) {
    return Response.json({ ok: false, error: 'missing fields' }, { status: 400 });
  }
  
  if (current !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'current password incorrect' }, { status: 400 });
  }
  
  // In a real app, you'd update .env.local securely
  // For now, we return success message - user needs to update Vercel environment variables manually
  // Or you can store password in a config file
  
  const configFilePath = path.join(process.cwd(), 'data', 'store', 'admin-password.json');
  try {
    await fs.writeFile(configFilePath, JSON.stringify({ password: newPassword }, null, 2));
    return Response.json({ ok: true, message: 'Password updated in config file. Note: For Vercel deployment, update the ADMIN_PASSWORD environment variable in Vercel dashboard.' });
  } catch (e) {
    return Response.json({ ok: false, error: 'Failed to update password' }, { status: 500 });
  }
}
