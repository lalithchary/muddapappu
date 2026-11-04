'use client';

import { Grid, LayoutGrid } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeView = searchParams?.get('view') ?? 'gallery';

  function setView(view: 'list' | 'gallery') {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('view', view);
    params.delete('page');
    router.replace(`/?${params.toString()}`);
  }

  return (
    <div className="view-toggle">
      <button
        onClick={() => setView('list')}
        className={activeView === 'list' ? 'active' : undefined}
        aria-pressed={activeView === 'list'}
        aria-label="List view"
        title="List view"
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        <span>List</span>
      </button>
      <button
        onClick={() => setView('gallery')}
        className={activeView === 'gallery' ? 'active' : undefined}
        aria-pressed={activeView === 'gallery'}
        aria-label="Gallery view"
        title="Gallery view"
      >
        <Grid className="h-4 w-4 mr-1" />
        <span>Gallery</span>
      </button>
    </div>
  );
}