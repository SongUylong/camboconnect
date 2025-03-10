import { LoadingSpinner } from "./loading-spinner";

export function PageLoading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
} 