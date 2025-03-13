import React from 'react';
import { Grid, List } from "lucide-react";

interface LayoutToggleProps {
  currentLayout: string;
  onToggle: (layout: string) => void;
}

export function LayoutToggle({ currentLayout, onToggle }: LayoutToggleProps) {
  return (
    <div className="hidden md:flex border rounded-md">
      <button
        onClick={() => onToggle("grid")}
        className={`p-2 ${
          currentLayout === "grid"
            ? "bg-blue-50 text-blue-600"
            : "bg-white text-gray-500 hover:text-gray-700"
        }`}
        aria-label="Grid view"
      >
        <Grid className="h-5 w-5" />
      </button>
      <button
        onClick={() => onToggle("list")}
        className={`p-2 ${
          currentLayout === "list"
            ? "bg-blue-50 text-blue-600"
            : "bg-white text-gray-500 hover:text-gray-700"
        }`}
        aria-label="List view"
      >
        <List className="h-5 w-5" />
      </button>
    </div>
  );
} 