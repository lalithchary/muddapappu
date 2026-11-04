'use client';

import Image from 'next/image';
import { useState } from 'react';

export function Logo() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative h-8 w-8">
      {!imgError && (
        <Image
          src="/logo.svg"
          alt="Muddapappu Logo"
          fill
          sizes="32px"
          className="object-contain"
          priority
          onError={() => setImgError(true)}
        />
      )}
      {/* Fallback text logo if SVG fails to load */}
      {imgError && (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange">
          <span className="text-xs font-mono text-bg">M</span>
        </div>
      )}
    </div>
  );
}