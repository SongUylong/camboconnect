interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}

export function LoadingSkeleton({ 
  className = "", 
  count = 1, 
  height = "h-4", 
  width = "w-full" 
}: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${height} ${width} ${className}`}
        />
      ))}
    </div>
  );
} 