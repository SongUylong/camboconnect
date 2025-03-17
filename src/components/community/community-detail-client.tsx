"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Building, Calendar, Filter, Globe, Users, X, ChevronDown, Search } from "lucide-react";
import { FollowButton } from "@/components/community/follow-button";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { useOrganizationOpportunities, useOrganizationCategories } from "@/hooks/use-community";
import { Organization, Opportunity, Category } from "@/api/community";

interface CommunityDetailClientProps {
  organization: Organization;
  initialOpportunities: Opportunity[];
  initialCategories: Category[];
  initialCategoryFilter: string;
  initialStatusFilter: string;
}

export function CommunityDetailClient({
  organization,
  initialOpportunities,
  initialCategories,
  initialCategoryFilter,
  initialStatusFilter,
}: CommunityDetailClientProps) {
  // State
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Use React Query hooks for data fetching
  const { 
    data: opportunities = initialOpportunities,
    isLoading: isLoadingOpportunities 
  } = useOrganizationOpportunities(
    organization.id,
    { status: statusFilter, category: categoryFilter }
  );

  const { 
    data: categories = initialCategories,
    isLoading: isLoadingCategories 
  } = useOrganizationCategories(organization.id);

  // Close filter menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setCategoryFilter("");
    setStatusFilter("");
    setShowFilterMenu(false);
  };

  // Apply filters
  const applyFilters = () => {
    // Filters are automatically applied via React Query dependencies
    setShowFilterMenu(false);
  };

  // Filter opportunities based on search text
  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = searchQuery === "" || 
      opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Count active filters (excluding empty filters)
  const activeFilterCount = [
    statusFilter, 
    categoryFilter
  ].filter(filter => filter !== "").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back Button with improved styling */}
      <div className="mb-6 sm:mb-8">
        <Link 
          href="/community" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm sm:text-base">Back to Community</span>
        </Link>
      </div>
      
      {/* Organization Header with enhanced styling */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Hero section with gradient background */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-8 sm:px-8 sm:py-10 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden border border-gray-200">
              {organization.logo ? (
                <Image
                  src={organization.logo}
                  alt={organization.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  width={96}
                  height={96}
                />
              ) : (
                <Building className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{organization.name}</h1>
              <div className="flex flex-wrap items-center gap-4">
                {organization.website && (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200 text-sm text-blue-600 hover:text-blue-800 hover:border-blue-300 transition-colors duration-200"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    <span className="truncate">{organization.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200 text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{organization.followerCount} followers</span>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{organization.opportunityCount} opportunities</span>
                </div>
              </div>
            </div>
            <div className="md:self-start">
              <FollowButton organizationId={organization.id} />
            </div>
          </div>
        </div>

        {/* Description and About sections */}
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 leading-relaxed">{organization.description}</p>
          </div>

          {/* Foldable About Section with smooth transition */}
          {organization.history && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <button 
                onClick={() => setShowAbout(!showAbout)}
                className="w-full flex items-center justify-between text-left group"
              >
                <h2 className="text-xl font-semibold text-gray-900">About {organization.name}</h2>
                <span className={`text-blue-600 transform transition-transform duration-200 ${showAbout ? 'rotate-180' : ''}`}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
              <div className={`mt-4 transition-all duration-200 ease-in-out ${showAbout ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                <p className="text-gray-600 leading-relaxed">{organization.history}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Opportunities Section */}
      <div className="mt-8 sm:mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Opportunities</h2>
          
          {/* Search and Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full sm:w-64 pl-8 py-2"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="btn btn-outline flex items-center gap-1 relative"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              {/* Filter Popup Menu */}
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">Filters</h3>
                      <button 
                        onClick={() => setShowFilterMenu(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Category Filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="input w-full text-sm"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Status Filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input w-full text-sm"
                      >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="OPENING_SOON">Opening Soon</option>
                        <option value="CLOSING_SOON">Closing Soon</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                    
                    {/* Filter Actions */}
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={applyFilters}
                        className="btn btn-sm btn-primary"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingOpportunities && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* No Results */}
        {!isLoadingOpportunities && filteredOpportunities.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">No opportunities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* Opportunities Grid */}
        {!isLoadingOpportunities && filteredOpportunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={{
                  ...opportunity,
                  deadline: new Date(opportunity.deadline),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 