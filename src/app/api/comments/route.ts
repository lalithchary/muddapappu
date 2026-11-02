import { repo } from '@/lib/repo-instance';
import type { Comment } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dealSlug = url.searchParams.get('dealSlug') || undefined;
  const mode = url.searchParams.get('mode');

  if (mode === 'counts') {
    const counts = await repo().commentCounts();
    return Response.json({ ok: true, counts });
  }

  const comments = await repo().listComments(dealSlug);
  return Response.json({ ok: true, comments });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const author = String(body.author || '').trim() || 'Anonymous Shopper';
    const message = String(body.message || '').trim();
    const dealSlug = body.dealSlug ? String(body.dealSlug) : undefined;

    if (!message) {
      return Response.json({ ok: false, error: 'Message cannot be empty' }, { status: 400 });
    }
    if (message.length > 2000) {
      return Response.json({ ok: false, error: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    const comment: Comment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dealSlug,
      author,
      message,
      createdAt: new Date().toISOString(),
    };

    await repo().addComment(comment);
    return Response.json({ ok: true, comment });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message || 'Failed to save comment' }, { status: 500 });
  }
}