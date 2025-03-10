import { LoadingSpinner } from "./loading-spinner";

interface LoadingOverlayProps {
  text?: string;
}

export function LoadingOverlay({ text }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <LoadingSpinner size="lg" text={text || "Loading..."} />
      </div>
    </div>
  );
} 