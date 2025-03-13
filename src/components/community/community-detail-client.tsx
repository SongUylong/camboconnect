"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Building, Calendar, Filter, Globe, Users, X, ChevronDown, Search, Loader2 } from "lucide-react";
import { FollowButton } from "@/components/community/follow-button";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { OpportunityFilter } from "@/components/opportunities/opportunity-filter";
import { useOrganizationOpportunities } from '@/hooks/use-opportunities';
import { useBookmarkOpportunity, useUnbookmarkOpportunity } from '@/hooks/use-opportunities';
import { toast } from 'sonner';
import { Category, Opportunity as BaseOpportunity, OpportunityStatus } from "@/types";

// Define types
type Organization = {
  id: string;
  name: string;
  description: string;
  logo?: string | null;
  website?: string | null;
  followerCount: number;
  opportunityCount: number;
  history?: string | null;
  termsOfService?: string | null;
};

// Updated Opportunity type to match OpportunityCard props
type Opportunity = Omit<BaseOpportunity, 'status'> & {
  status: OpportunityStatus;
  categoryId: string;
  organizationId: string;
};

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
  // Transform initial opportunities to ensure deadline is a Date object
  const transformedInitialOpportunities = initialOpportunities.map(opp => ({
    ...opp,
    deadline: opp.deadline instanceof Date ? opp.deadline : new Date(opp.deadline)
  }));
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>(transformedInitialOpportunities);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Build query parameters for filters
  const queryParams = new URLSearchParams();
  if (statusFilter) {
    queryParams.set("status", statusFilter);
  }
  if (categoryFilter) {
    queryParams.set("category", categoryFilter);
  }

  // Use React Query hooks
  const { data: opportunitiesData, isLoading: queryLoading, refetch } = useOrganizationOpportunities(
    organization.id,
    queryParams
  );
  const bookmarkOpportunity = useBookmarkOpportunity();
  const unbookmarkOpportunity = useUnbookmarkOpportunity();

  // Update opportunities when data changes from API
  useEffect(() => {
    if (opportunitiesData?.opportunities) {
      const transformedOpportunities = opportunitiesData.opportunities.map(opp => ({
        ...opp,
        deadline: new Date(opp.deadline),
        startDate: opp.startDate ? new Date(opp.startDate) : null,
        endDate: opp.endDate ? new Date(opp.endDate) : null,
        status: opp.status as OpportunityStatus,
        categoryId: opp.category.id,
        organizationId: opp.organization.id
      })) as unknown as Opportunity[];
      
      setOpportunities(transformedOpportunities);
    }
  }, [opportunitiesData]);

  // Update active filter count
  useEffect(() => {
    const count = [statusFilter, categoryFilter].filter(filter => filter !== "").length;
    setActiveFilterCount(count);
  }, [statusFilter, categoryFilter]);

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    // Update query params
    const params = new URLSearchParams(queryParams.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    
    // Update URL without navigation
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params.toString()}`
    );
    
    // Apply optimistic UI
    if (opportunitiesData?.opportunities) {
      const filtered = opportunitiesData.opportunities.filter(opp => {
        const matchesCategory = !value || opp.category.id === value;
        const matchesStatus = !statusFilter || opp.status === statusFilter;
        return matchesCategory && matchesStatus;
      }).map(opp => ({
        ...opp,
        deadline: new Date(opp.deadline),
        startDate: opp.startDate ? new Date(opp.startDate) : null,
        endDate: opp.endDate ? new Date(opp.endDate) : null,
        status: opp.status as OpportunityStatus,
        categoryId: opp.category.id,
        organizationId: opp.organization.id
      })) as unknown as Opportunity[];
      
      setOpportunities(filtered);
    }
    
    // Trigger refetch
    refetch();
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    // Update query params
    const params = new URLSearchParams(queryParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    
    // Update URL without navigation
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params.toString()}`
    );
    
    // Apply optimistic UI
    if (opportunitiesData?.opportunities) {
      const filtered = opportunitiesData.opportunities.filter(opp => {
        const matchesStatus = !value || opp.status === value;
        const matchesCategory = !categoryFilter || opp.category.id === categoryFilter;
        return matchesStatus && matchesCategory;
      }).map(opp => ({
        ...opp,
        deadline: new Date(opp.deadline),
        startDate: opp.startDate ? new Date(opp.startDate) : null,
        endDate: opp.endDate ? new Date(opp.endDate) : null,
        status: opp.status as OpportunityStatus,
        categoryId: opp.category.id,
        organizationId: opp.organization.id
      })) as unknown as Opportunity[];
      
      setOpportunities(filtered);
    }
    
    // Trigger refetch
    refetch();
  };

  // Reset all filters
  const resetFilters = () => {
    setCategoryFilter("");
    setStatusFilter("");
    
    // Update URL without navigation
    window.history.replaceState(
      {},
      '',
      window.location.pathname
    );
    
    // Trigger refetch
    refetch();
  };

  const handleBookmark = async (opportunityId: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await unbookmarkOpportunity.mutateAsync(opportunityId);
        toast.success('Opportunity unbookmarked');
      } else {
        await bookmarkOpportunity.mutateAsync(opportunityId);
        toast.success('Opportunity bookmarked');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (queryLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Filter opportunities based on search query
  const filteredOpportunities = opportunities.filter((opportunity) =>
    opportunity.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <img
                  src={organization.logo}
                  alt={organization.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
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

      {/* Opportunities Section with improved filtering UI */}
      <div className="mt-8 sm:mt-12">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Opportunities</h2>
            
            {/* Filter Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search opportunities..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {/* Filter Button */}
              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg border ${
                    activeFilterCount > 0 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-white border-gray-200 text-gray-700'
                  } hover:bg-gray-50 transition-colors duration-200`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Filter Popup Menu with enhanced styling */}
                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg z-10 border border-gray-200">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                        <button 
                          onClick={() => setShowFilterMenu(false)}
                          className="text-gray-400 hover:text-gray-600"
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
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Statuses</option>
                          <option value="ACTIVE">Active</option>
                          <option value="OPENING_SOON">Opening Soon</option>
                          <option value="CLOSING_SOON">Closing Soon</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                      
                      {/* Filter Actions */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Reset all
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFilterMenu(false)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Apply filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Opportunities Grid with loading and empty states */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="max-w-sm mx-auto">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-sm text-gray-500">
                This organization doesn't have any opportunities matching your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={{
                  ...opportunity,
                  description: opportunity.description || '',
                  eligibility: opportunity.eligibility || '',
                  applicationProcess: opportunity.applicationProcess || '',
                  benefits: opportunity.benefits || '',
                  contactInfo: opportunity.contactInfo || '',
                  externalLink: opportunity.externalLink || null,
                  deadline: new Date(opportunity.deadline),
                  startDate: opportunity.startDate ? new Date(opportunity.startDate) : null,
                  endDate: opportunity.endDate ? new Date(opportunity.endDate) : null,
                  createdAt: opportunity.createdAt || new Date(),
                  updatedAt: opportunity.updatedAt || new Date(),
                  categoryId: opportunity.category.id,
                  organizationId: opportunity.organization.id,
                  status: opportunity.status as OpportunityStatus
                }}
                onBookmark={(isBookmarked) => handleBookmark(opportunity.id, isBookmarked)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Terms of Service Section with improved styling */}
      {organization.termsOfService && (
        <div className="mt-12">
          <button 
            onClick={() => setShowTerms(!showTerms)}
            className="w-full flex items-center justify-between text-left group bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors duration-200"
          >
            <h2 className="text-xl font-semibold text-gray-900">Terms of Service</h2>
            <span className={`text-blue-600 transform transition-transform duration-200 ${showTerms ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-5 w-5" />
            </span>
          </button>
          <div className={`mt-4 transition-all duration-200 ease-in-out ${showTerms ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-600 leading-relaxed">{organization.termsOfService}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 