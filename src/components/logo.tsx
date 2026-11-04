'use client';

import Image from 'next/image';
import { useState } from 'react';

export function Logo() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative h-8 w-8">
      {!imgError && (
        <Image
          src="/logo.jpg"
          alt="Muddapappu Logo"
          fill
          sizes="32px"
          className="object-contain logo-image"
          priority
          onError={() => setImgError(true)}
        />
      )}
      {(imgError || true) && (
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          className="text-accent-orange"
          fill="none"
        >
          <circle cx="50" cy="50" r="46" fill="#8B7D6B" />
          <circle cx="50" cy="50" r="42" fill="#A89987" />
          <circle cx="50" cy="50" r="38" fill="#B8AA97" />
          <g stroke="#9A8C79" strokeWidth="2" strokeDasharray="4 6" fill="none">
            <circle cx="50" cy="50" r="34" />
          </g>
          <path d="M32 38 Q35 22 50 20 Q65 22 68 38 Q75 45 70 58 Q65 68 50 70 Q35 68 30 58 Q25 45 32 38 Z" fill="#FFFFFF" opacity="0.98" />
        </svg>
      )}
    </div>
  );
}