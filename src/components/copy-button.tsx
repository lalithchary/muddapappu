'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export function CopyButton({ code, ctaUrl }: { code: string; ctaUrl?: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // fallback: select text
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
    }
  }

  return (
    <button
      onClick={copy}
      className="btn-primary flex items-center gap-1.5 py-2 text-xs"
    >
      <Check className="h-3.5 w-3.5" />
      Copy {code}
    </button>
  );
}