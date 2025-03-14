import { MainLayout } from "@/components/layout/main-layout";
import { OpportunityFilter } from "@/components/opportunities/opportunity-filter";
import { OpportunitySearch } from "@/components/opportunities/opportunity-search";
import { OpportunitiesClient } from "@/components/opportunities/opportunities-client";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface SearchParams {
  status?: string;
  category?: string;
  sort?: string;
  q?: string;
  page?: string;
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

  // Parse pagination params
  const page = parseInt(searchParams.page || "1");
  const pageSize = 12; // 12 items per page (4 rows of 3 in desktop view)

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

  // Fetch opportunities with applied filters and pagination
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
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  // Get total count for pagination
  const totalCount = await db.opportunity.count({
    where: whereClause,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

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

          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <OpportunitySearch />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="col-span-1">
            <OpportunityFilter categories={categories} />
          </div>

          {/* Opportunities Grid with Pagination */}
          <div className="col-span-1 lg:col-span-3">
            <OpportunitiesClient 
              initialOpportunities={transformedOpportunities}
              initialTotalPages={totalPages}
              initialCurrentPage={page}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}