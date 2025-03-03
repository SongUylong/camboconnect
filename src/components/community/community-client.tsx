"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Grid, List, Search, Calendar, Building, ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import Link from "next/link";
import { OrganizationCard } from "@/components/community/organization-card";
import { FollowButton } from "@/components/community/follow-button";

// Define the organization type
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

// Define the opportunity type
type Opportunity = {
  id: string;
  title: string;
  shortDescription: string;
  deadline: string;
  status: string;
  category: {
    id: string;
    name: string;
  };
};

// Define the category type
type Category = {
  id: string;
  name: string;
};

interface CommunityClientProps {
  initialOrganizations: Organization[];
  initialSearchQuery: string;
  initialLayout: string;
}

export function CommunityClient({
  initialOrganizations,
  initialSearchQuery,
  initialLayout,
}: CommunityClientProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [layout, setLayout] = useState(initialLayout);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations || []);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [opportunityFilter, setOpportunityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Set the selected organization to the first one when in list view
  useEffect(() => {
    if (layout === "list" && organizations.length > 0 && !selectedOrganization) {
      setSelectedOrganization(organizations[0]);
    }
  }, [layout, organizations, selectedOrganization]);

  // Fetch opportunities when selected organization or filters change
  useEffect(() => {
    if (selectedOrganization) {
      fetchOpportunities(selectedOrganization.id);
    }
  }, [selectedOrganization, statusFilter, categoryFilter]);

  // Fetch categories when selected organization changes
  useEffect(() => {
    if (selectedOrganization) {
      fetchCategories();
    }
  }, [selectedOrganization]);

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

  // Fetch categories for the selected organization
  const fetchCategories = async () => {
    if (!selectedOrganization) return;
    
    try {
      // Use the opportunities endpoint with getCategories=true to get only categories for this organization
      const response = await fetch(`/api/organizations/${selectedOrganization.id}/opportunities?getCategories=true`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        
        // Reset category filter if the currently selected category is no longer available
        if (categoryFilter && !data.some((cat: Category) => cat.id === categoryFilter)) {
          setCategoryFilter("");
        }
      } else {
        console.error("Failed to fetch categories:", response.statusText);
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  // Fetch opportunities for the selected organization
  const fetchOpportunities = async (organizationId: string) => {
    setIsLoadingOpportunities(true);
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
      const response = await fetch(`/api/organizations/${organizationId}/opportunities${queryString}`);
      
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data);
      } else {
        console.error("Failed to fetch opportunities:", response.statusText);
        setOpportunities([]);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
      setOpportunities([]);
    } finally {
      setIsLoadingOpportunities(false);
    }
  };

  // Handle layout toggle
  const toggleLayout = (newLayout: string) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("layout", newLayout);
    router.push(`/community?${params.toString()}`);
    setLayout(newLayout);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(urlSearchParams.toString());
    if (searchQuery) {
      params.set("q", searchQuery);
    } else {
      params.delete("q");
    }
    params.set("layout", layout);
    router.push(`/community?${params.toString()}`);
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

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "OPENING_SOON":
        return "bg-purple-100 text-purple-800";
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "CLOSING_SOON":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "OPENING_SOON":
        return "Opening Soon";
      case "ACTIVE":
        return "Active";
      case "CLOSING_SOON":
        return "Closing Soon";
      case "CLOSED":
        return "Closed";
      default:
        return status;
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setOpportunityFilter("");
    setStatusFilter("");
    setCategoryFilter("");
    setShowFilterMenu(false);
  };

  // Apply filters
  const applyFilters = () => {
    // Filters are automatically applied via the useEffect dependency array
    setShowFilterMenu(false);
  };

  // Filter opportunities based on search text only
  // (status and category filtering is now handled by the API)
  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunityFilter === "" || 
      opportunity.title.toLowerCase().includes(opportunityFilter.toLowerCase()) ||
      opportunity.shortDescription.toLowerCase().includes(opportunityFilter.toLowerCase());
    
    return matchesSearch;
  });

  // Count active filters (excluding empty filters)
  const activeFilterCount = [
    statusFilter, 
    categoryFilter
  ].filter(filter => filter !== "").length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect with organizations across Cambodia
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center w-full md:w-auto">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex-grow md:flex-grow-0 mr-2">
            <div className="relative">
              <input
                type="text"
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizations..."
                className="input w-full md:w-80 pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </form>

          {/* Layout Toggle - Hidden on Mobile */}
          <div className="hidden md:flex border rounded-md">
            <button
              onClick={() => toggleLayout("grid")}
              className={`p-2 ${
                layout === "grid"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-white text-gray-500 hover:text-gray-700"
              }`}
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleLayout("list")}
              className={`p-2 ${
                layout === "list"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-white text-gray-500 hover:text-gray-700"
              }`}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* No organizations found message */}
      {organizations.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900">No organizations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria
          </p>
        </div>
      )}

      {/* Grid Layout */}
      {layout === "grid" && organizations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((organization) => (
            <OrganizationCard key={organization.id} organization={organization} />
          ))}
        </div>
      )}

      {/* List Layout */}
      {layout === "list" && organizations.length > 0 && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Panel - Organizations List */}
          <div className="w-full md:w-1/3 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {organizations.map((organization) => (
                <div
                  key={organization.id}
                  onClick={() => setSelectedOrganization(organization)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedOrganization?.id === organization.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                      {organization.logo ? (
                        <img
                          src={organization.logo}
                          alt={organization.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 text-gray-400">🏢</div>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{organization.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                        {organization.description.substring(0, 60)}
                        {organization.description.length > 60 ? "..." : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Organization Details */}
          {selectedOrganization && (
            <div className="w-full md:w-2/3 bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                  {selectedOrganization.logo ? (
                    <img
                      src={selectedOrganization.logo}
                      alt={selectedOrganization.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 text-gray-400">🏢</div>
                  )}
                </div>
                <div className="md:ml-6 mt-4 md:mt-0 flex-1">
                  <h1 className="text-xl font-bold text-gray-900">{selectedOrganization.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-4">
                    {selectedOrganization.website && (
                      <a
                        href={selectedOrganization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <span className="truncate">{selectedOrganization.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                    <div className="text-sm text-gray-500 flex items-center">
                      <span>{selectedOrganization.followerCount} followers</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <span>{selectedOrganization.opportunityCount} opportunities</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <FollowButton organizationId={selectedOrganization.id} />
                </div>
              </div>

              <div className="mt-6 prose prose-blue max-w-none">
                <p>{selectedOrganization.description}</p>
              </div>

              {/* Foldable About Section */}
              {selectedOrganization.history && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <button 
                    onClick={() => setShowAbout(!showAbout)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">About {selectedOrganization.name}</h2>
                    <span className="text-blue-600">
                      {showAbout ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </span>
                  </button>
                  
                  {showAbout && (
                    <div className="mt-2 prose prose-blue max-w-none">
                      <p>{selectedOrganization.history}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Opportunities Section with Filter Button */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Opportunities</h2>
                  
                  {/* Search and Filter */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={opportunityFilter}
                        onChange={(e) => setOpportunityFilter(e.target.value)}
                        className="input w-32 sm:w-40 text-sm pl-8 py-1"
                      />
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="relative" ref={filterMenuRef}>
                      <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="btn btn-sm btn-outline flex items-center gap-1 relative"
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
                
                {isLoadingOpportunities ? (
                  <div className="mt-4 flex justify-center">
                    <div className="animate-pulse text-gray-500">Loading opportunities...</div>
                  </div>
                ) : filteredOpportunities.length === 0 ? (
                  <div className="mt-4 bg-gray-50 rounded-md p-4 text-center">
                    <p className="text-gray-500">No opportunities available</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {filteredOpportunities.map((opportunity) => (
                      <Link 
                        key={opportunity.id}
                        href={`/opportunities/${opportunity.id}`}
                        className="block bg-white border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-md font-medium text-gray-900">{opportunity.title}</h3>
                            <div className="mt-1 flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(opportunity.status)}`}>
                                {getStatusText(opportunity.status)}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {opportunity.category.name}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Deadline: {formatDate(opportunity.deadline)}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {opportunity.shortDescription}
                        </p>
                      </Link>
                    ))}
                    
                    {selectedOrganization.opportunityCount > opportunities.length && (
                      <Link
                        href={`/community/${selectedOrganization.id}`}
                        className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                      >
                        View all {selectedOrganization.opportunityCount} opportunities
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 