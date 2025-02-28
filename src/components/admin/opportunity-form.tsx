"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Organization {
  id: string;
  name: string;
}

interface OpportunityFormProps {
  categories: Category[];
  organizations: Organization[];
  initialData?: any;
  isEdit?: boolean;
}

export default function OpportunityForm({
  categories,
  organizations,
  initialData,
  isEdit = false,
}: OpportunityFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    eligibility: "",
    applicationProcess: "",
    benefits: "",
    contactInfo: "",
    externalLink: "",
    deadline: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
    categoryId: "",
    organizationId: "",
    isPopular: false,
    ...initialData,
  });
  
  // Format dates for form inputs
  useEffect(() => {
    if (initialData) {
      // Format dates as YYYY-MM-DD for date inputs
      const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };
      
      setFormData({
        ...initialData,
        deadline: formatDate(initialData.deadline),
        startDate: formatDate(initialData.startDate),
        endDate: formatDate(initialData.endDate),
      });
    }
  }, [initialData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      const requiredFields = [
        'title', 'shortDescription', 'description', 'eligibility',
        'applicationProcess', 'benefits', 'contactInfo', 'deadline',
        'categoryId', 'organizationId', 'status'
      ];
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          throw new Error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        }
      }
      
      // API endpoint and method
      const endpoint = isEdit 
        ? `/api/opportunities/${initialData.id}` 
        : '/api/opportunities';
      const method = isEdit ? 'PUT' : 'POST';
      
      // Send data to API
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save opportunity');
      }
      
      // Redirect on success
      router.push('/admin/opportunities');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
        
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        
        {/* Short Description */}
        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Short Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            className="input w-full"
            maxLength={150}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Brief summary (max 150 characters) to display on cards
          </p>
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="input w-full"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Organization */}
        <div>
          <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-1">
            Organization <span className="text-red-500">*</span>
          </label>
          <select
            id="organizationId"
            name="organizationId"
            value={formData.organizationId}
            onChange={handleChange}
            className="input w-full"
            required
          >
            <option value="">Select an organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input w-full"
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="OPENING_SOON">Opening Soon</option>
            <option value="CLOSING_SOON">Closing Soon</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Detailed Information</h2>
        
        {/* Full Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Full Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input w-full min-h-[200px]"
            required
          />
        </div>
        
        {/* Eligibility */}
        <div>
          <label htmlFor="eligibility" className="block text-sm font-medium text-gray-700 mb-1">
            Eligibility Requirements <span className="text-red-500">*</span>
          </label>
          <textarea
            id="eligibility"
            name="eligibility"
            value={formData.eligibility}
            onChange={handleChange}
            className="input w-full min-h-[100px]"
            required
          />
        </div>
        
        {/* Application Process */}
        <div>
          <label htmlFor="applicationProcess" className="block text-sm font-medium text-gray-700 mb-1">
            Application Process <span className="text-red-500">*</span>
          </label>
          <textarea
            id="applicationProcess"
            name="applicationProcess"
            value={formData.applicationProcess}
            onChange={handleChange}
            className="input w-full min-h-[100px]"
            required
          />
        </div>
        
        {/* Benefits */}
        <div>
          <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1">
            Benefits <span className="text-red-500">*</span>
          </label>
          <textarea
            id="benefits"
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            className="input w-full min-h-[100px]"
            required
          />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Dates and Contact</h2>
        
        {/* Deadline */}
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
            Application Deadline <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="input w-full"
          />
        </div>
        
        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="input w-full"
          />
        </div>
        
        {/* Contact Info */}
        <div>
          <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Information <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contactInfo"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            className="input w-full"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Email or phone number for inquiries</p>
        </div>
        
        {/* External Link */}
        <div>
          <label htmlFor="externalLink" className="block text-sm font-medium text-gray-700 mb-1">
            External Application Link
          </label>
          <input
            type="url"
            id="externalLink"
            name="externalLink"
            value={formData.externalLink || ""}
            onChange={handleChange}
            className="input w-full"
            placeholder="https://..."
          />
          <p className="mt-1 text-sm text-gray-500">
            If provided, users will be directed to this link to apply
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Additional Settings</h2>
        
        {/* Featured Setting */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPopular"
            name="isPopular"
            checked={formData.isPopular}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPopular" className="ml-2 block text-sm text-gray-900">
            Mark as Popular/Featured
          </label>
          <p className="ml-6 text-sm text-gray-500">
            Featured opportunities will be highlighted on the platform
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-outline"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? "Saving..." : isEdit ? "Update Opportunity" : "Create Opportunity"}
        </button>
      </div>
    </form>
  );
}