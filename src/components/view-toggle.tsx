'use client';

import { useState, useEffect } from 'react';
import { Grid, List } from 'lucide-react';

export function ViewToggle() {
  const [viewMode, setViewMode] = useState<'grid' | 'gallery'>('grid');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('muddapappu-view-mode');
      if (saved === 'gallery') setViewMode('gallery');
    } catch {}
  }, []);

  const toggleView = () => {
    const next = viewMode === 'grid' ? 'gallery' : 'grid';
    setViewMode(next);
    try {
      localStorage.setItem('muddapappu-view-mode', next);
    } catch {}
  };

  return (
    <button
      onClick={toggleView}
      className="view-toggle"
      aria-label="Toggle view mode"
      title={viewMode === 'grid' ? 'Switch to gallery view' : 'Switch to list view'}
    >
      {viewMode === 'grid' ? (
        <>
          <List className="h-4 w-4 mr-1" />
          <span>Gallery</span>
        </>
      ) : (
        <>
          <Grid className="h-4 w-4 mr-1" />
          <span>List</span>
        </>
      )}
    </button>
  );
}