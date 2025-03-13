import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  height?: string;
}

export function LoadingSkeleton({ count = 1, height = "h-4" }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-gray-200 rounded animate-pulse`}
        />
      ))}
    </>
  );
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
      />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="mt-4 space-y-4">
      <LoadingSkeleton count={3} height="h-24" />
      <div className="flex justify-center">
        <LoadingSpinner size="md" text="Loading opportunities..." />
      </div>
    </div>
  );
} 