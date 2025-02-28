"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

type CategoryType = {
  id: string;
  name: string;
};

type FilterProps = {
  categories: CategoryType[];
};

export function OpportunityFilter({ categories }: FilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState<string>(searchParams.get("status") || "");
  const [category, setCategory] = useState<string>(searchParams.get("category") || "");
  const [sort, setSort] = useState<string>(searchParams.get("sort") || "latest");

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    
    if (sort && sort !== "latest") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  }, [status, category, sort, router, pathname, searchParams]);

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
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
              onChange={(e) => setSort(e.target.value)}
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
          onClick={() => {
            setStatus("");
            setCategory("");
            setSort("latest");
          }}
          className="btn btn-outline w-full mt-2"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}