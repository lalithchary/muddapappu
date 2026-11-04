'use client';

import Image from 'next/image';
import { useState } from 'react';

export function Logo() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative h-8 w-8">
      {!imgError && (
        <Image
          src="/logo23.svg"
          alt="Muddapappu Logo"
          fill
          sizes="32px"
          className="object-contain"
          priority
          onError={() => setImgError(true)}
        />
      )}
      {/* Fallback to existing logo.svg if logo23.svg fails */}
      {imgError && (
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
    </div>
  );
}