"use client";

import { useState } from "react";
import Image from "next/image";

interface GoogleImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function GoogleImage({ src, alt, className, width = 100, height = 100 }: GoogleImageProps) {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-full">
        <span className="text-gray-400 text-xl">{alt.charAt(0)}</span>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        className={className}
        referrerPolicy="no-referrer"
        width={width}
        height={height}
        onError={() => setHasError(true)}
      />
    </div>
  );
} 