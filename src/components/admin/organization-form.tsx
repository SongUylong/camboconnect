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
    coverImage: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    type: "COMPANY", // COMPANY, UNIVERSITY, NONPROFIT, GOVERNMENT
    size: "SMALL", // SMALL, MEDIUM, LARGE
    industry: "",
    foundedYear: "",
    isVerified: false,
    isActive: true,
    socialMedia: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
    },
    ...initialData,
  });
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Ensure social media object exists
        socialMedia: {
          linkedin: "",
          twitter: "",
          facebook: "",
          instagram: "",
          ...(initialData.socialMedia || {}),
        },
      });
    }
  }, [initialData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.startsWith('social.')) {
      // Handle social media fields
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value,
        },
      }));
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
        'name', 'description', 'email', 'type', 'industry'
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
        
        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Organization Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="input w-full"
            required
          >
            <option value="COMPANY">Company</option>
            <option value="UNIVERSITY">University</option>
            <option value="NONPROFIT">Non-Profit</option>
            <option value="GOVERNMENT">Government</option>
          </select>
        </div>
        
        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
            Industry <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        
        {/* Size */}
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
            Organization Size
          </label>
          <select
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="SMALL">Small (1-50 employees)</option>
            <option value="MEDIUM">Medium (51-500 employees)</option>
            <option value="LARGE">Large (500+ employees)</option>
          </select>
        </div>
        
        {/* Founded Year */}
        <div>
          <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 mb-1">
            Founded Year
          </label>
          <input
            type="number"
            id="foundedYear"
            name="foundedYear"
            value={formData.foundedYear}
            onChange={handleChange}
            className="input w-full"
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
        
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
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>
        
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input w-full"
          />
        </div>
        
        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input w-full"
          />
        </div>
        
        {/* City, State, Country */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Social Media</h2>
        
        {/* LinkedIn */}
        <div>
          <label htmlFor="social.linkedin" className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn
          </label>
          <input
            type="url"
            id="social.linkedin"
            name="social.linkedin"
            value={formData.socialMedia.linkedin}
            onChange={handleChange}
            className="input w-full"
            placeholder="https://linkedin.com/company/example"
          />
        </div>
        
        {/* Twitter */}
        <div>
          <label htmlFor="social.twitter" className="block text-sm font-medium text-gray-700 mb-1">
            Twitter
          </label>
          <input
            type="url"
            id="social.twitter"
            name="social.twitter"
            value={formData.socialMedia.twitter}
            onChange={handleChange}
            className="input w-full"
            placeholder="https://twitter.com/example"
          />
        </div>
        
        {/* Facebook */}
        <div>
          <label htmlFor="social.facebook" className="block text-sm font-medium text-gray-700 mb-1">
            Facebook
          </label>
          <input
            type="url"
            id="social.facebook"
            name="social.facebook"
            value={formData.socialMedia.facebook}
            onChange={handleChange}
            className="input w-full"
            placeholder="https://facebook.com/example"
          />
        </div>
        
        {/* Instagram */}
        <div>
          <label htmlFor="social.instagram" className="block text-sm font-medium text-gray-700 mb-1">
            Instagram
          </label>
          <input
            type="url"
            id="social.instagram"
            name="social.instagram"
            value={formData.socialMedia.instagram}
            onChange={handleChange}
            className="input w-full"
            placeholder="https://instagram.com/example"
          />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Media & Status</h2>
        
        {/* Logo URL */}
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
        </div>
        
        {/* Cover Image URL */}
        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image URL
          </label>
          <input
            type="url"
            id="coverImage"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            className="input w-full"
            placeholder="https://example.com/cover.jpg"
          />
        </div>
        
        {/* Status Checkboxes */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVerified"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-700">
              Verified Organization
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : isEdit ? 'Update Organization' : 'Create Organization'}
        </button>
      </div>
    </form>
  );
}
