"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Edit, 
  Plus, 
  Search, 
  Trash2, 
  Filter, 
  Eye, 
  ArrowUpDown,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Organization {
  id: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  history: string;
  termsOfService: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  createdAt: Date;
  _count: {
    opportunities: number;
  };
}

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: authStatus } = useSession();
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOrgId, setDeleteOrgId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Parse search params
  const query = searchParams.get('q') || "";
  const filterStatus = searchParams.get('status') || "";
  const sort = searchParams.get('sort') || "createdAt-desc";
  const page = parseInt(searchParams.get('page') || "1");
  
  useEffect(() => {

    // Redirect if not authenticated
    if (authStatus === "unauthenticated") {
      console.log("Redirecting to login - unauthenticated");
      router.push("/login");
      return;
    }

    // Only fetch if authenticated and admin
    if (authStatus === "authenticated" && session?.user?.isAdmin) {
      const fetchOrganizations = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await fetch(`/api/admin/organizations?${searchParams.toString()}`);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error("API Error Response:", response.status, errorData);
            throw new Error(errorData?.message || 'Failed to fetch organizations');
          }
          
          const data = await response.json();
          
          setOrganizations(data.organizations);
          setTotalPages(data.totalPages);
        } catch (error) {
          console.error("Error fetching organizations:", error);
          setError((error as Error).message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrganizations();
    } else {
      console.log("Not fetching - not authenticated as admin");
    }
  }, [searchParams, session, authStatus, router]);

  // If loading session, show loading state
  if (authStatus === "loading") {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  // If not authenticated or not admin, show message
  if (!session?.user?.isAdmin) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-gray-500">Please sign in as an admin to manage organizations</p>
        </div>
      </MainLayout>
    );
  }

  const handleFilterChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`/admin/organizations?${params.toString()}`);
  };

  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteOrganization = async () => {
    if (!deleteOrgId) return;
    
    try {
      const response = await fetch(`/api/organizations/${deleteOrgId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          throw new Error('Cannot delete organization that has existing opportunities. Please delete all opportunities first.');
        }
        throw new Error(data.error || 'Failed to delete organization');
      }

      // Update UI immediately by removing the deleted organization
      setOrganizations(prevOrgs => 
        prevOrgs.filter(org => org.id !== deleteOrgId)
      );
      setDeleteOrgId(null);
      setDeleteError(null);
    } catch (error) {
      console.error('Error deleting organization:', error);
      setDeleteError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Organizations</h1>
          <div className="flex space-x-2">
            <Link href="/admin/organizations/new" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add New Organization
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleFilterChange('q', formData.get('q') as string);
              }}>
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Search organizations..."
                    className="input w-full pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <button type="submit" className="sr-only">Search</button>
                </div>
              </form>
            </div>
            
           
            {/* Sort */}
            <div className="w-full sm:w-auto">
              <select
                name="sort"
                value={sort}
                className="input w-full"
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Loading organizations...</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900">No organizations found</h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your filters or create a new organization.
              </p>
              <div className="mt-6">
                <Link href="/admin/organizations/new" className="btn btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Organization
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
                        Organization
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Website
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opportunities
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {org.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {org.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {org.website ? (
                              <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {new URL(org.website).hostname}
                              </a>
                            ) : (
                              <span className="text-gray-500">Not provided</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(org.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {org._count?.opportunities || 0} opportunities
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link 
                              href={`/community/${org.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              target="_blank"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                            <Link 
                              href={`/admin/organizations/${org.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => setDeleteOrgId(org.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handleFilterChange('page', String(page - 1))}
                      disabled={page === 1}
                      className={`btn btn-outline ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handleFilterChange('page', String(page + 1))}
                      disabled={page === totalPages}
                      className={`btn btn-outline ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handleFilterChange('page', String(page - 1))}
                          disabled={page === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handleFilterChange('page', String(pageNum))}
                              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${pageNum === page ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handleFilterChange('page', String(page + 1))}
                          disabled={page === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Add the delete confirmation modal: */}
        <Dialog open={!!deleteOrgId} onOpenChange={() => {
          setDeleteOrgId(null);
          setDeleteError(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Organization</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-500 mb-4">
                Are you sure you want to delete this organization? This action cannot be undone.
              </p>
              {deleteError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md mb-4">
                  {deleteError}
                </div>
              )}
            </div>
            <DialogFooter>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setDeleteOrgId(null);
                  setDeleteError(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-destructive"
                onClick={handleDeleteOrganization}
              >
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
