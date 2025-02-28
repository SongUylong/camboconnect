import { MainLayout } from "@/components/layout/main-layout";
import { OrganizationCard } from "@/components/community/organization-card";
import { db } from "@/lib/prisma";
import { Search } from "lucide-react";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  // Build query conditions based on search params
  const whereClause: any = {};

  if (searchParams.q) {
    whereClause.OR = [
      {
        name: {
          contains: searchParams.q,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: searchParams.q,
          mode: "insensitive",
        },
      },
    ];
  }

  // Fetch organizations
  const organizations = await db.organization.findMany({
    where: whereClause,
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          followers: true,
          opportunities: true,
        },
      },
    },
  });

  // Transform for the component
  const organizationsWithCounts = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    description: org.description,
    logo: org.logo,
    website: org.website,
    followerCount: org._count.followers,
    opportunityCount: org._count.opportunities,
  }));

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community</h1>
            <p className="mt-1 text-sm text-gray-500">
              Connect with organizations across Cambodia
            </p>
          </div>

          {/* Search Box */}
          <form className="mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={searchParams.q || ""}
                placeholder="Search organizations..."
                className="input w-full md:w-80 pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </form>
        </div>

        {/* Organizations Grid */}
        {organizations.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">No organizations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizationsWithCounts.map((organization) => (
              <OrganizationCard key={organization.id} organization={organization} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}