"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      Back
    </button>
  );
} 