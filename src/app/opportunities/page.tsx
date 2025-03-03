import { MainLayout } from "@/components/layout/main-layout";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { OpportunityFilter } from "@/components/opportunities/opportunity-filter";
import { db } from "@/lib/prisma";
import { Search } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface SearchParams {
  status?: string;
  category?: string;
  sort?: string;
  q?: string;
}

// Set export const dynamic to force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Get current user session for bookmark status
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Fetch categories for filter
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Build query conditions based on search params
  const whereClause: any = {};

  if (searchParams.status) {
    whereClause.status = searchParams.status;
  }

  if (searchParams.category) {
    whereClause.categoryId = searchParams.category;
  }

  if (searchParams.q) {
    whereClause.OR = [
      {
        title: {
          contains: searchParams.q,
          mode: "insensitive",
        },
      },
      {
        shortDescription: {
          contains: searchParams.q,
          mode: "insensitive",
        },
      },
    ];
  }

  // Build orderBy based on sort param
  let orderBy: any = { createdAt: "desc" };

  if (searchParams.sort === "deadline") {
    orderBy = { deadline: "asc" };
  } else if (searchParams.sort === "popular") {
    orderBy = { visitCount: "desc" };
  }

  // Fetch opportunities with applied filters
  const opportunities = await db.opportunity.findMany({
    where: whereClause,
    orderBy,
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      bookmarks: userId ? {
        where: {
          userId,
        },
      } : false,
    },
  });

  // Transform opportunities to include bookmark status
  const transformedOpportunities = opportunities.map(opportunity => {
    const { bookmarks, ...rest } = opportunity as any;
    return {
      ...rest,
      isBookmarked: userId ? bookmarks?.length > 0 : false,
    };
  });

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
            <p className="mt-1 text-sm text-gray-500">
              Discover opportunities across Cambodia
            </p>
          </div>

          {/* Search Box */}
          <form className="mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={searchParams.q || ""}
                placeholder="Search opportunities..."
                className="input w-full md:w-80 pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="col-span-1">
            <OpportunityFilter categories={categories} />
          </div>

          {/* Opportunities Grid */}
          <div className="col-span-1 lg:col-span-3">
            {transformedOpportunities.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900">No opportunities found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {transformedOpportunities.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}