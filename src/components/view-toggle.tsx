'use client';

import { Grid, LayoutGrid } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeView = searchParams?.get('view') ?? 'grid';

  function setView(view: 'grid' | 'gallery') {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('view', view);
    params.delete('page');
    router.replace(`/?${params.toString()}`);
  }

  return (
    <div className="view-toggle">
      <button
        onClick={() => setView('grid')}
        className={activeView === 'grid' ? 'active' : undefined}
        aria-pressed={activeView === 'grid'}
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