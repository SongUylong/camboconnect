"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Edit, 
  Plus, 
  Search, 
  Trash2, 
  Filter, 
  Eye, 
  Download, 
  ArrowUpDown,
  Tag
} from "lucide-react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";

interface Opportunity {
  id: string;
  title: string;
  status: string;
  deadline: string;
  createdAt: string;
  visitCount: number;
  organization: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  _count: {
    applications: number;
    bookmarks: number;
    participations: number;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

export default function AdminOpportunitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Category management state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse search params
  const query = searchParams.get('q') || "";
  const categoryId = searchParams.get('category') || "";
  const status = searchParams.get('status') || "";
  const sort = searchParams.get('sort') || "createdAt-desc";
  const page = parseInt(searchParams.get('page') || "1");
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch opportunities
        const opportunitiesRes = await fetch(`/api/admin/opportunities?${searchParams.toString()}`);
        if (!opportunitiesRes.ok) throw new Error('Failed to fetch opportunities');
        const opportunitiesData = await opportunitiesRes.json();
        
        setOpportunities(opportunitiesData.opportunities);
        setTotalPages(opportunitiesData.totalPages);
        
        // Fetch categories
        const categoriesRes = await fetch('/api/admin/categories');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesRes.json();
        
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Add visibility change event listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    
    // Add focus event listener
    const handleFocus = () => {
      fetchData();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [searchParams, router]);
  
  const handleFilterChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`/admin/opportunities?${params.toString()}`);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "OPENING_SOON":
        return "bg-gray-100 text-gray-800";
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

  // Category management functions
  const resetCategoryForm = () => {
    setCategoryName("");
    setCategoryDescription("");
    setCategoryError("");
    setEditingCategory(null);
    setIsAddingCategory(false);
  };

  const handleAddCategory = () => {
    setIsAddingCategory(true);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryError("");
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryError("");
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete category');
      }

      // Refresh categories
      const categoriesRes = await fetch('/api/admin/categories');
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
      const categoriesData = await categoriesRes.json();
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while deleting the category');
    }
  };

  const handleSubmitCategory = async () => {
    // Validate form
    if (!categoryName.trim()) {
      setCategoryError("Category name is required");
      return;
    }

    setIsSubmitting(true);
    setCategoryError("");

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}` 
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryName.trim(),
          description: categoryDescription.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save category');
      }

      // Refresh categories
      const categoriesRes = await fetch('/api/admin/categories');
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
      const categoriesData = await categoriesRes.json();
      
      setCategories(categoriesData);
      resetCategoryForm();
    } catch (error) {
      console.error('Error saving category:', error);
      setCategoryError(error instanceof Error ? error.message : 'An error occurred while saving the category');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            
            <Dialog>
              <DialogTrigger asChild>
                <button className="btn btn-outline">
                  <Tag className="h-4 w-4 mr-2" />
                  Manage Categories
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Manage Categories</DialogTitle>
                </DialogHeader>
                
                <div className="py-4">
                  {/* Category Form */}
                  {(isAddingCategory || editingCategory) ? (
                    <div className="mb-6 p-4 border border-gray-200 rounded-md">
                      <h3 className="text-lg font-medium mb-4">
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name *
                          </label>
                          <input
                            type="text"
                            id="categoryName"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="input w-full"
                            placeholder="Enter category name"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                          </label>
                          <textarea
                            id="categoryDescription"
                            value={categoryDescription}
                            onChange={(e) => setCategoryDescription(e.target.value)}
                            className="input w-full h-24"
                            placeholder="Enter category description"
                          />
                        </div>
                        
                        {categoryError && (
                          <div className="text-red-500 text-sm">{categoryError}</div>
                        )}
                        
                        <div className="flex justify-end space-x-2">
                          <button 
                            type="button" 
                            onClick={resetCategoryForm}
                            className="btn btn-outline"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            onClick={handleSubmitCategory}
                            className="btn btn-primary"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Saving...' : 'Save Category'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Categories</h3>
                      </div>
                      
                      {categories.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No categories found. Add your first category.</p>
                      ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {categories.map((category) => (
                            <div 
                              key={category.id} 
                              className="flex justify-between items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                            >
                              <div>
                                <h4 className="font-medium">{category.name}</h4>
                                {category.description && (
                                  <p className="text-sm text-gray-500">{category.description}</p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  {!isAddingCategory && !editingCategory && (
                    <button 
                      type="button" 
                      onClick={handleAddCategory}
                      className="btn btn-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Category
                    </button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
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
                    placeholder="Search opportunities..."
                    className="input w-full pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <button type="submit" className="sr-only">Search</button>
                </div>
              </form>
            </div>
            
            {/* Category Filter */}
            <div className="w-full sm:w-auto">
              <select
                name="category"
                value={categoryId}
                className="input w-full"
                onChange={(e) => handleFilterChange('category', e.target.value)}
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
                value={status}
                className="input w-full"
                onChange={(e) => handleFilterChange('status', e.target.value)}
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
                value={sort}
                className="input w-full"
                onChange={(e) => handleFilterChange('sort', e.target.value)}
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
          {isLoading ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Loading opportunities...</p>
            </div>
          ) : opportunities.length === 0 ? (
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
                            ID: {opportunity.id}
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
                            {new Date(opportunity.deadline).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(opportunity.status)}`}>
                            {opportunity.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            <div>{opportunity.visitCount} views</div>
                            <div>{opportunity._count.applications} applications</div>
                            <div>{opportunity._count.bookmarks} bookmarks</div>
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
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this opportunity?')) {
                                  // Delete logic here
                                }
                              }}
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
      </div>
    </MainLayout>
  );
}