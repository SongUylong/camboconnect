'use client';

import { useQuery } from "@tanstack/react-query";
import { useLoading } from "@/hooks/use-loading";
import { LoadingSpinner } from "./loading-spinner";

interface ExampleProps {
  queryKey: string;
}

export function LoadingExample({ queryKey }: ExampleProps) {
  // Example query
  const { data } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      // Simulate a network request
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { message: "Data loaded successfully!" };
    },
  });

  // Use our custom loading hook to check if this specific query is loading
  const { isLoading } = useLoading({ queryKey: [queryKey] });

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-2">Loading Example</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="md" text="Loading data..." />
        </div>
      ) : (
        <div>
          <p>{data?.message || "No data available"}</p>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>This component uses the useLoading hook to show a loading indicator while data is being fetched.</p>
        <p>The page-wide loading overlay will also appear during data fetching.</p>
      </div>
    </div>
  );
} 