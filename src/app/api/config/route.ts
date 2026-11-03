import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import { ADMIN_PASSWORD } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'store', 'affiliate-config.json');

// GitHub repo info for persistence
const GITHUB_REPO = 'lalithchary/muddapappu';
const GITHUB_TOKEN = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;

export async function GET() {
  const cookie = (await cookies()).get('admin_session');
  if (!cookie || cookie.value !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  try {
    const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
    return Response.json({ ok: true, config });
  } catch {
    // Return default config if file doesn't exist
    return Response.json({ ok: true, config: getDefaultConfig() });
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
  
  // Write to local filesystem (for Vercel preview/development)
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(body.config, null, 2));

  // Also persist to GitHub for production deployments
  if (GITHUB_TOKEN) {
    try {
      await persistToGitHub(body.config);
    } catch (e) {
      console.error('Failed to persist to GitHub:', e);
    }
  }
  
  return Response.json({ ok: true });
}

function getDefaultConfig() {
  const stores = ['amazon', 'flipkart', 'myntra', 'ajio', 'swiggy', 'zomato', 'zepto', 'bigbasket'];
  const config: Record<string, { tag: string; useCuelinks: boolean }> = {};
  stores.forEach(store => {
    config[store] = { tag: 'muddapappu', useCuelinks: true };
  });
  return config;
}

async function persistToGitHub(config: Record<string, { tag: string; useCuelinks: boolean }>) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN not set');
  }

  const timestamp = new Date().toISOString();
  const content = JSON.stringify(config, null, 2);
  const encodedContent = Buffer.from(content).toString('base64');

  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // Get current file SHA if it exists
  let sha: string | null = null;
  try {
    const fileRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/data/store/affiliate-config.json`, {
      headers,
    });
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      sha = fileData.sha;
    }
  } catch {
    // File doesn't exist yet
  }

  // Update the file
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/data/store/affiliate-config.json`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `Update affiliate config - ${timestamp}`,
      content: encodedContent,
      sha,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${text}`);
  }
}