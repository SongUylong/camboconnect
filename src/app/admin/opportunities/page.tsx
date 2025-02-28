import { MainLayout } from "@/components/layout/main-layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { 
  Edit, 
  Plus, 
  Search, 
  Trash2, 
  Filter, 
  Eye, 
  Download, 
  ArrowUpDown 
} from "lucide-react";
import { format } from "date-fns";

interface SearchParams {
  q?: string;
  category?: string;
  status?: string;
  sort?: string;
  page?: string;
}

export default async function AdminOpportunitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session || !session.user.isAdmin) {
    redirect("/login");
  }

  // Parse search params
  const query = searchParams.q || "";
  const categoryId = searchParams.category;
  const status = searchParams.status;
  const sort = searchParams.sort || "createdAt-desc";
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;
  
  // Build where clause
  const whereClause: any = {};
  
  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { shortDescription: { contains: query, mode: "insensitive" } },
    ];
  }
  
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }
  
  if (status) {
    whereClause.status = status;
  }
  
  // Parse sort
  const [sortField, sortOrder] = sort.split("-");
  const orderBy: any = {};
  orderBy[sortField] = sortOrder;
  
  // Fetch opportunities
  const opportunities = await db.opportunity.findMany({
    where: whereClause,
    include: {
      organization: true,
      category: true,
      _count: {
        select: {
          applications: true,
          bookmarks: true,
          participations: true,
        },
      },
    },
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  
  // Get total count for pagination
  const totalCount = await db.opportunity.count({
    where: whereClause,
  });
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Fetch categories for filter
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Opportunities</h1>
          <div className="flex space-x-2">
            <Link href="/admin/opportunities/new" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add New Opportunity
            </Link>
            <Link href="/admin/opportunities/export" className="btn btn-outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <form>
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Search opportunities..."
                    className="input w-full pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </form>
            </div>
            
            {/* Category Filter */}
            <div className="w-full sm:w-auto">
              <select
                name="category"
                defaultValue={categoryId || ""}
                className="input w-full"
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value) {
                    url.searchParams.set("category", e.target.value);
                  } else {
                    url.searchParams.delete("category");
                  }
                  url.searchParams.set("page", "1");
                  window.location.href = url.toString();
                }}
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
            <div className="w-full sm:w-auto">
              <select
                name="status"
                defaultValue={status || ""}
                className="input w-full"
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value) {
                    url.searchParams.set("status", e.target.value);
                  } else {
                    url.searchParams.delete("status");
                  }
                  url.searchParams.set("page", "1");
                  window.location.href = url.toString();
                }}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="OPENING_SOON">Opening Soon</option>
                <option value="CLOSING_SOON">Closing Soon</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            
            {/* Sort */}
            <div className="w-full sm:w-auto">
              <select
                name="sort"
                defaultValue={sort}
                className="input w-full"
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("sort", e.target.value);
                  window.location.href = url.toString();
                }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="deadline-asc">Deadline (Soonest)</option>
                <option value="deadline-desc">Deadline (Latest)</option>
                <option value="visitCount-desc">Most Viewed</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {opportunities.length === 0 ? (
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900">No opportunities found</h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your filters or create a new opportunity.
              </p>
              <div className="mt-6">
                <Link href="/admin/opportunities/new" className="btn btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Opportunity
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opportunity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {opportunities.map((opportunity) => (
                      <tr key={opportunity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {opportunity.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            Created {format(new Date(opportunity.createdAt), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {opportunity.organization.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {opportunity.category.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(opportunity.deadline), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            opportunity.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : opportunity.status === 'CLOSING_SOON'
                              ? 'bg-yellow-100 text-yellow-800'
                              : opportunity.status === 'OPENING_SOON'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {opportunity.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            <div>Views: {opportunity.visitCount}</div>
                            <div>Applications: {opportunity._count.applications}</div>
                            <div>Bookmarks: {opportunity._count.bookmarks}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link 
                              href={`/opportunities/${opportunity.id}`} 
                              className="text-blue-600 hover:text-blue-900"
                              target="_blank"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                            <Link 
                              href={`/admin/opportunities/${opportunity.id}/edit`} 
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <Link 
                              href={`/admin/opportunities/${opportunity.id}/delete`} 
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(page * pageSize, totalCount)}
                        </span>{' '}
                        of <span className="font-medium">{totalCount}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <Link
                          href={{
                            pathname: '/admin/opportunities',
                            query: {
                              ...searchParams,
                              page: Math.max(1, page - 1).toString(),
                            },
                          }}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            page <= 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Show pages around the current page
                          let pageNum = page;
                          if (page <= 3) {
                            // Near the start
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            // Near the end
                            pageNum = totalPages - 4 + i;
                          } else {
                            // Middle
                            pageNum = page - 2 + i;
                          }
                          
                          // Skip if out of bounds
                          if (pageNum <= 0 || pageNum > totalPages) {
                            return null;
                          }
                          
                          return (
                            <Link
                              key={pageNum}
                              href={{
                                pathname: '/admin/opportunities',
                                query: {
                                  ...searchParams,
                                  page: pageNum.toString(),
                                },
                              }}
                              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                page === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </Link>
                          );
                        })}
                        
                        <Link
                          href={{
                            pathname: '/admin/opportunities',
                            query: {
                              ...searchParams,
                              page: Math.min(totalPages, page + 1).toString(),
                            },
                          }}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            page >= totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}