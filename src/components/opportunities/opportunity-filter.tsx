"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Category } from '@/types';

interface FilterProps {
  categories: Category[];
  onFilterChange: (type: string, value: string) => void;
  selectedCategory?: string;
  selectedStatus?: string;
  onReset?: () => void;
}

export function OpportunityFilter({ 
  categories, 
  onFilterChange,
  selectedCategory = "",
  selectedStatus = "",
  onReset
}: FilterProps) {
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<string>("latest");
  
  // Handle status change
  const handleStatusChange = (value: string) => {
    onFilterChange("status", value);
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    onFilterChange("category", value);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSort(value);
    onFilterChange("sort", value);
  };

  // Handle reset
  const handleReset = () => {
    // Reset local state
    setSort("latest");
    
    // Call parent reset handler if provided
    if (onReset) {
      onReset();
    } else {
      // Fallback to individual resets
      handleStatusChange("");
      handleCategoryChange("");
      handleSortChange("latest");
    }
  };

  // Initialize sort value from URL on first render
  useEffect(() => {
    const sortParam = searchParams.get("sort");
    if (sortParam) {
      setSort(sortParam);
    }
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="relative">
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="input appearance-none pr-10 w-full"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="OPENING_SOON">Opening Soon</option>
              <option value="CLOSING_SOON">Closing Soon</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
          </div>
        </div>
        
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <div className="relative">
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input appearance-none pr-10 w-full"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
          </div>
        </div>
        
        {/* Sort Option */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <div className="relative">
            <select
              id="sort"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="input appearance-none pr-10 w-full"
            >
              <option value="latest">Latest</option>
              <option value="deadline">Deadline (Soonest)</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
          </div>
        </div>
        
        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="btn btn-outline w-full mt-2"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}