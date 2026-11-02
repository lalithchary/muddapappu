'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import type { Comment } from '@/lib/types';

export function CommentModal({
  dealSlug,
  dealTitle,
  onClose,
  onCommentAdded,
}: {
  dealSlug?: string;
  dealTitle?: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Save author name locally for convenience
    try {
      const saved = localStorage.getItem('muddapappu-author');
      if (saved) setAuthor(saved);
    } catch {}

    const fetchComments = async () => {
      setLoading(true);
      try {
        const url = dealSlug ? `/api/comments?dealSlug=${encodeURIComponent(dealSlug)}` : '/api/comments';
        const res = await fetch(url);
        const data = await res.json();
        if (data.ok) setComments(data.comments);
      } catch (err) {
        console.error('Failed to load comments', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [dealSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const authorName = author.trim() || 'Shopper';
      try {
        localStorage.setItem('muddapappu-author', authorName);
      } catch {}

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealSlug,
          author: authorName,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error || 'Could not post comment');
      } else {
        setMessage('');
        setComments((prev) => [data.comment, ...prev]);
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err: any) {
      setError(err.message || 'Error posting message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-deal-500" />
            <div>
              <h3 className="font-semibold text-ink-100">
                {dealTitle ? 'Product Discussion' : 'Community Discussion'}
              </h3>
              {dealTitle && (
                <p className="max-w-xs truncate text-xs text-ink-400 sm:max-w-sm">
                  {dealTitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-400 hover:bg-ink-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comment Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-ink-500">Loading discussion…</div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-400">
              No messages yet. Be the first to start the discussion!
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="rounded-xl border border-ink-800 bg-ink-950/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-deal-400 flex items-center gap-1">
                    <User className="h-3 w-3" /> {c.author}
                  </span>
                  <span className="text-[10px] text-ink-500">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-ink-200 whitespace-pre-wrap">{c.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="border-t border-ink-800 p-4 bg-ink-950/40 rounded-b-2xl space-y-2">
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Your Name / Handle"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-1/3 rounded-xl border border-ink-700 bg-ink-900 px-3 py-2 text-xs text-ink-100 placeholder:text-ink-500 focus:border-deal-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder={dealTitle ? "Ask a question or leave feedback..." : "Share a deal, request product, or chat..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-xl border border-ink-700 bg-ink-900 px-3 py-2 text-xs text-ink-100 placeholder:text-ink-500 focus:border-deal-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="grid place-items-center rounded-xl bg-deal-500 px-3 py-2 text-white hover:bg-deal-600 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}