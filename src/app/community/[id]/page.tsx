import { MainLayout } from "@/components/layout/main-layout";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building, Calendar, Filter, Globe, Users } from "lucide-react";
import { FollowButton } from "@/components/community/follow-button";

interface OrganizationParams {
  id: string;
}

export default async function OrganizationPage({
  params,
  searchParams,
}: {
  params: OrganizationParams;
  searchParams: { category?: string; status?: string };
}) {
  // Fetch organization with opportunities count
  const organization = await db.organization.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          followers: true,
          opportunities: true,
        },
      },
    },
  });

  if (!organization) {
    notFound();
  }

  // Build query for opportunities
  const whereClause: any = {
    organizationId: organization.id,
  };

  if (searchParams.category) {
    whereClause.categoryId = searchParams.category;
  }

  if (searchParams.status) {
    whereClause.status = searchParams.status;
  }

  // Fetch organization's opportunities
  const opportunities = await db.opportunity.findMany({
    where: whereClause,
    orderBy: {
      deadline: "asc",
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      category: true,
    },
  });

  // Fetch only the categories that this organization has opportunities for
  const organizationCategories = await db.category.findMany({
    where: {
      opportunities: {
        some: {
          organizationId: organization.id,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
                  <span>{organization._count.followers} followers</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{organization._count.opportunities} opportunities</span>
                </div>
              </div>
            </div>
            <div className="mt-3 md:mt-0">
              <FollowButton organizationId={organization.id} />
            </div>
          </div>

          {/* Show description in a collapsible way on mobile */}
          <div className="mt-4 sm:mt-6 prose prose-blue max-w-none text-sm sm:text-base">
            <p>{organization.description}</p>
          </div>

          {/* Hide history on mobile, show on larger screens */}
          {organization.history && (
            <div className="hidden sm:block mt-6">
              <h2 className="text-lg font-semibold text-gray-900">About {organization.name}</h2>
              <div className="mt-2 prose prose-blue max-w-none">
                <p>{organization.history}</p>
              </div>
            </div>
          )}
        </div>

        {/* Opportunities Section - Focus on Grid View for Mobile */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Opportunities</h2>
            
            {/* Simplified Filters for Mobile */}
            <form className="w-full sm:w-auto flex flex-wrap gap-2">
              {organizationCategories.length > 0 && (
                <div className="relative flex-1 sm:flex-none">
                  <select
                    name="category"
                    defaultValue={searchParams.category || ""}
                    className="w-full sm:w-auto input appearance-none pr-8 py-1 pl-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    {organizationCategories.map((category) => (
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
                  name="status"
                  defaultValue={searchParams.status || ""}
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
              
              <button type="submit" className="w-full sm:w-auto btn btn-sm btn-outline">
                Apply Filters
              </button>
            </form>
          </div>

          {opportunities.length === 0 ? (
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
        
        {/* Terms of Service Section - Hide on Mobile */}
        {organization.termsOfService && (
          <div className="hidden sm:block mt-12">
            <h2 className="text-xl font-semibold text-gray-900">Terms of Service</h2>
            <div className="mt-4 bg-gray-50 rounded-md p-6">
              <div className="prose prose-blue max-w-none">
                <p>{organization.termsOfService}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}