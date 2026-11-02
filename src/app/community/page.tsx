'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Send, User, Tag } from 'lucide-react';
import type { Comment } from '@/lib/types';

export default function CommunityPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('muddapappu-author');
      if (saved) setAuthor(saved);
    } catch {}
    fetchComments();
  }, []);

  async function fetchComments() {
    try {
      const res = await fetch('/api/comments');
      const data = await res.json();
      if (data.ok) setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const displayName = author.trim() || 'Anonymous Shopper';
      try { localStorage.setItem('muddapappu-author', displayName); } catch {}
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: displayName, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to post');
      setMessage('');
      await fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Tab navigation */}
      <div className="mb-6 flex items-center gap-1 border-b border-ink-800 pb-px">
        <a href="/" className="border-b-2 border-transparent px-4 py-2 text-sm text-ink-400 hover:text-white transition-colors">
          Deals
        </a>
        <span className="border-b-2 border-deal-500 px-4 py-2 text-sm font-semibold text-white">
          Community Chat
        </span>
      </div>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Muddapappu <span className="text-deal-500">Community</span>
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Request products, share deals you found, discuss purchases, or just chat with fellow shoppers.
        </p>
      </div>

      {/* Compose box */}
      <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-ink-800 bg-ink-900/50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-ink-500 shrink-0" />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={50}
            className="flex-1 rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:border-deal-500 focus:outline-none"
          />
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about a product, share a deal tip, or start a discussion…"
            rows={3}
            maxLength={2000}
            required
            className="flex-1 resize-none rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:border-deal-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="grid place-items-center rounded-lg bg-deal-500 px-4 py-2.5 text-white hover:bg-deal-600 disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>

      {/* Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-ink-900/60" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-ink-800 bg-ink-900/30 p-8 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-ink-600" />
          <p className="text-sm text-ink-400">No messages yet. Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-ink-800 bg-ink-900/40 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-deal-500/15 text-[10px] font-bold text-deal-500">
                    {(c.author || 'A')[0].toUpperCase()}
                  </div>
                  <span className="truncate text-sm font-medium text-ink-200">{c.author || 'Anonymous'}</span>
                  {c.dealSlug && (
                    <a href={`/deal/${c.dealSlug}`} className="shrink-0 flex items-center gap-1 rounded-md bg-ink-800 px-1.5 py-0.5 text-[10px] text-ink-400 hover:text-deal-500 transition-colors">
                      <Tag className="h-3 w-3" />
                      deal
                    </a>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-ink-500">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-300">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}