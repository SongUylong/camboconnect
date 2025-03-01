"use client";

import { useState } from "react";

interface GoogleImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function GoogleImage({ src, alt, className }: GoogleImageProps) {
  const [hasError, setHasError] = useState(false);
  
  if (hasError || !src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 font-medium">
          {alt[0]?.toUpperCase() || 'U'}
        </span>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className={className}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
      />
    </div>
  );
} 