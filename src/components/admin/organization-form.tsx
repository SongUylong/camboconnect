"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

interface OrganizationFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function OrganizationForm({
  initialData,
  isEdit = false,
}: OrganizationFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    logo: "",
    history: "",
    termsOfService: "",
    ...initialData,
  });
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      });
    }
  }, [initialData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      const requiredFields = [
        'name', 'description'
      ];
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          throw new Error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        }
      }
      
      // API endpoint and method
      const endpoint = isEdit 
        ? `/api/organizations/${initialData.id}` 
        : '/api/organizations';
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
        throw new Error(errorData.error || 'Failed to save organization');
      }
      
      // Redirect on success
      router.push('/admin/organizations');
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
        
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="input w-full"
            required
          />
        </div>
        
        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="input w-full"
            placeholder="https://example.com"
          />
        </div>
        
        {/* Logo */}
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
            Logo URL
          </label>
          <input
            type="url"
            id="logo"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            className="input w-full"
            placeholder="https://example.com/logo.png"
          />
          <p className="mt-1 text-sm text-gray-500">
            Direct link to the organization's logo image
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Additional Information</h2>
        
        {/* History */}
        <div>
          <label htmlFor="history" className="block text-sm font-medium text-gray-700 mb-1">
            Organization History
          </label>
          <textarea
            id="history"
            name="history"
            value={formData.history}
            onChange={handleChange}
            rows={4}
            className="input w-full"
          />
          <p className="mt-1 text-sm text-gray-500">
            Brief history of the organization, when it was founded, etc.
          </p>
        </div>
        
        {/* Terms of Service */}
        <div>
          <label htmlFor="termsOfService" className="block text-sm font-medium text-gray-700 mb-1">
            Terms of Service
          </label>
          <textarea
            id="termsOfService"
            name="termsOfService"
            value={formData.termsOfService}
            onChange={handleChange}
            rows={4}
            className="input w-full"
          />
          <p className="mt-1 text-sm text-gray-500">
            Any specific terms or conditions for users interacting with this organization
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
          {submitting ? "Saving..." : isEdit ? "Update Organization" : "Create Organization"}
        </button>
      </div>
    </form>
  );
}
