import { MainLayout } from "@/components/layout/main-layout";
import { OpportunityFilter } from "@/components/opportunities/opportunity-filter";
import { OpportunitySearch } from "@/components/opportunities/opportunity-search";
import { OpportunitiesClient } from "@/components/opportunities/opportunities-client";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Interface defining the possible URL search parameters for filtering opportunities
 * - status: Filter by opportunity status (e.g., "open", "closed")
 * - category: Filter by category ID
 * - sort: Sort order for results (e.g., "deadline", "popular")
 * - q: Search query string for text search
 * - page: Current page number for pagination
 */
interface SearchParams {
  status?: string;
  category?: string;
  sort?: string;
  q?: string;
  page?: string;
}

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic';
// Disable caching to always fetch the latest data
export const revalidate = 0;

/**
 * OpportunitiesPage - Server Component
 * 
 * Main page for displaying and filtering opportunities.
 * This component:
 * 1. Fetches opportunities based on search/filter parameters
 * 2. Handles pagination
 * 3. Checks user's bookmark status for each opportunity
 * 4. Renders the filter sidebar and opportunities grid
 * 
 * @param searchParams - URL query parameters for filtering and pagination
 */
export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Get current user session to determine bookmark status
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Fetch all categories for the filter sidebar dropdown
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Parse pagination parameters
  const page = parseInt(searchParams.page || "1");
  const pageSize = 12; // 12 items per page (4 rows of 3 in desktop view)

  // Build database query conditions based on search parameters
  const whereClause: any = {};

  // Add status filter if provided
  if (searchParams.status) {
    whereClause.status = searchParams.status;
  }

  // Add category filter if provided
  if (searchParams.category) {
    whereClause.categoryId = searchParams.category;
  }

  // Add text search if query parameter is provided
  // Searches in both title and shortDescription fields
  if (searchParams.q) {
    whereClause.OR = [
      {
        title: {
          contains: searchParams.q,
          mode: "insensitive", // Case-insensitive search
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

  // Set default sort order to newest first
  let orderBy: any = { createdAt: "desc" };

  // Apply different sort orders based on the sort parameter
  if (searchParams.sort === "deadline") {
    orderBy = { deadline: "asc" }; // Sort by closest deadline first
  } else if (searchParams.sort === "popular") {
    orderBy = { visitCount: "desc" }; // Sort by most visited first
  }

  // Fetch opportunities with applied filters, sorting, and pagination
  // Include related organization and category data
  // Also check if the current user has bookmarked each opportunity
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
      // Only fetch bookmarks if user is logged in
      bookmarks: userId ? {
        where: {
          userId,
        },
      } : false,
    },
    skip: (page - 1) * pageSize, // Skip records for pagination
    take: pageSize, // Limit number of records per page
  });

  // Get total count of matching opportunities for pagination calculation
  const totalCount = await db.opportunity.count({
    where: whereClause,
  });

  // Calculate total number of pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Transform opportunities to include bookmark status
  // This simplifies the data structure for the client component
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
        {/* Page header with title and search bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
            <p className="mt-1 text-sm text-gray-500">
              Discover opportunities across Cambodia
            </p>
          </div>

          {/* Search component for text-based filtering */}
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <OpportunitySearch />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar with filter options */}
          <div className="col-span-1">
            <OpportunityFilter categories={categories} />
          </div>

          {/* Main content area with opportunities grid */}
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