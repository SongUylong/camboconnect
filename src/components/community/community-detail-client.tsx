"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Building, Calendar, Filter, Globe, Users, X } from "lucide-react";
import { FollowButton } from "@/components/community/follow-button";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";

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
type Opportunity = {
  id: string;
  title: string;
  shortDescription: string;
  deadline: Date;
  status: "OPENING_SOON" | "ACTIVE" | "CLOSING_SOON" | "CLOSED";
  visitCount: number;
  isPopular: boolean;
  isNew: boolean;
  organization: {
    id: string;
    name: string;
    logo?: string | null;
  };
  category: {
    id: string;
    name: string;
  };
  isBookmarked?: boolean;
};

type Category = {
  id: string;
  name: string;
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

  // Fetch opportunities when filters change
  useEffect(() => {
    fetchOpportunities();
  }, [categoryFilter, statusFilter]);

  // Fetch opportunities based on current filters
  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      // Build query parameters for filters
      const queryParams = new URLSearchParams();
      if (statusFilter) {
        queryParams.set("status", statusFilter);
      }
      if (categoryFilter) {
        queryParams.set("category", categoryFilter);
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await fetch(`/api/organizations/${organization.id}/opportunities${queryString}`);
      
      if (response.ok) {
        const data = await response.json();
        // Transform API response to match the expected Opportunity type
        const transformedData = data.map((item: any) => {
          // Ensure all required properties exist
          const opportunity = {
            ...item,
            deadline: new Date(item.deadline),
            visitCount: typeof item.visitCount === 'number' ? item.visitCount : 0,
            isPopular: !!item.isPopular,
            isNew: !!item.isNew,
            isBookmarked: !!item.isBookmarked,
            // Ensure organization data is properly structured
            organization: {
              id: item.organization?.id || organization.id,
              name: item.organization?.name || organization.name,
              logo: item.organization?.logo || organization.logo
            },
            // Ensure category data is properly structured
            category: {
              id: item.category?.id || "",
              name: item.category?.name || "Uncategorized"
            }
          };
          return opportunity;
        });
        setOpportunities(transformedData);
      } else {
        console.error("Failed to fetch opportunities:", response.statusText);
        setOpportunities([]);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
      setOpportunities([]);
    } finally {
      setIsLoading(false);
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

  // Reset all filters
  const resetFilters = () => {
    setCategoryFilter("");
    setStatusFilter("");
  };

  return (
    <div className="py-4 sm:py-8">
      {/* Back Button - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <Link href="/community" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span className="text-sm sm:text-base">Back to Community</span>
        </Link>
      </div>
      
      {/* Organization Header - Simplified for Mobile */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            )}
          </div>
          <div className="md:ml-6 mt-3 md:mt-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{organization.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-4">
              {organization.website && (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="truncate">{organization.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{organization.followerCount} followers</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{organization.opportunityCount} opportunities</span>
              </div>
            </div>
          </div>
          <div className="mt-3 md:mt-0">
            <FollowButton organizationId={organization.id} />
          </div>
        </div>

        {/* Show description */}
        <div className="mt-4 sm:mt-6 prose prose-blue max-w-none text-sm sm:text-base">
          <p>{organization.description}</p>
        </div>

        {/* Foldable About Section */}
        {organization.history && (
          <div className="mt-6">
            <button 
              onClick={() => setShowAbout(!showAbout)}
              className="flex items-center text-lg font-semibold text-gray-900"
            >
              <span>About {organization.name}</span>
              <span className="ml-2 text-blue-600">
                {showAbout ? "▲" : "▼"}
              </span>
            </button>
            {showAbout && (
              <div className="mt-2 prose prose-blue max-w-none">
                <p>{organization.history}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Opportunities Section - Focus on Grid View for Mobile */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Opportunities</h2>
          
          {/* Simplified Filters */}
          <div className="w-full sm:w-auto flex flex-wrap gap-2">
            {categories.length > 0 && (
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto input appearance-none pr-8 py-1 pl-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
              </div>
            )}
            
            <div className="relative flex-1 sm:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto input appearance-none pr-8 py-1 pl-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="OPENING_SOON">Opening Soon</option>
                <option value="CLOSING_SOON">Closing Soon</option>
                <option value="CLOSED">Closed</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
            </div>
            
            <button 
              type="button" 
              onClick={resetFilters}
              className="w-full sm:w-auto btn btn-sm btn-outline"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8 text-center">
            <div className="animate-pulse text-gray-500">Loading opportunities...</div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8 text-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">No opportunities found</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              This organization doesn't have any opportunities matching your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </div>
      
      {/* Terms of Service Section - Foldable */}
      {organization.termsOfService && (
        <div className="mt-12">
          <button 
            onClick={() => setShowTerms(!showTerms)}
            className="flex items-center text-xl font-semibold text-gray-900"
          >
            <span>Terms of Service</span>
            <span className="ml-2 text-blue-600">
              {showTerms ? "▲" : "▼"}
            </span>
          </button>
          {showTerms && (
            <div className="mt-4 bg-gray-50 rounded-md p-6">
              <div className="prose prose-blue max-w-none">
                <p>{organization.termsOfService}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 