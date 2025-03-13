import React from 'react';
import { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory("")}
          className={`w-full text-left px-3 py-2 rounded-md text-sm ${
            selectedCategory === ""
              ? "bg-blue-50 text-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              selectedCategory === category.id
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
} 