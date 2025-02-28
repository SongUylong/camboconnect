import { MainLayout } from "@/components/layout/main-layout";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Building, Calendar, Filter, Globe, Users } from "lucide-react";
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

  // Fetch categories for filter
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

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

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Organization Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
              {organization.logo ? (
                <img
                  src={organization.logo}
                  alt={organization.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <div className="md:ml-6 mt-4 md:mt-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-4">
                {organization.website && (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    <span className="truncate">{organization.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                <div className="text-sm text-gray-500 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{organization._count.followers} followers</span>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{organization._count.opportunities} opportunities</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <FollowButton organizationId={organization.id} />
            </div>
          </div>

          <div className="mt-6 prose prose-blue max-w-none">
            <p>{organization.description}</p>
          </div>

          {organization.history && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">About {organization.name}</h2>
              <div className="mt-2 prose prose-blue max-w-none">
                <p>{organization.history}</p>
              </div>
            </div>
          )}
        </div>

        {/* Opportunities Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Opportunities</h2>
            
            {/* Filters */}
            <form className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <div className="relative">
                <select
                  name="category"
                  defaultValue={searchParams.category || ""}
                  className="input appearance-none pr-8 py-1 pl-2 text-sm"
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
              
              <div className="relative">
                <select
                  name="status"
                  defaultValue={searchParams.status || ""}
                  className="input appearance-none pr-8 py-1 pl-2 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OPENING_SOON">Opening Soon</option>
                  <option value="CLOSING_SOON">Closing Soon</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
              </div>
              
              <button type="submit" className="btn btn-sm btn-outline">
                Apply Filters
              </button>
            </form>
          </div>

          {opportunities.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900">No opportunities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                This organization doesn't have any opportunities matching your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}
        </div>
        
        {/* Terms of Service Section (if available) */}
        {organization.termsOfService && (
          <div className="mt-12">
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