"use client";

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Calendar, ExternalLink, Building } from 'lucide-react';
import Image from 'next/image';

export interface ViewedOpportunity {
  id: string;
  title: string;
  viewedAt: Date;
  organization: {
    id: string;
    name: string;
    logo?: string | null;
  };
  category: {
    id: string;
    name: string;
  };
}

interface ViewedOpportunitiesListProps {
  opportunities: ViewedOpportunity[];
  isLoading?: boolean;
}

export function ViewedOpportunitiesList({ opportunities, isLoading = false }: ViewedOpportunitiesListProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  
  const renderOrganizationLogo = (logo: string | null | undefined, name: string) => {
    if (logo) {
      return (
        <Image
          src={logo}
          alt={`${name} logo`}
          width={40}
          height={40}
          className="object-cover w-full h-full"
        />
      );
    }
    
    return (
      <Building className="h-6 w-6 text-gray-400" />
    );
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (opportunities.length === 0) {
    return (
      <div className="text-center py-8">
        <Eye className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No viewed opportunities</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't viewed any opportunities yet.
        </p>
        <div className="mt-6">
          <Link href="/opportunities" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Browse opportunities
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    );
  }
  
  // Sort opportunities based on user preference
  const sortedOpportunities = [...opportunities].sort((a, b) => {
    const dateA = new Date(a.viewedAt).getTime();
    const dateB = new Date(b.viewedAt).getTime();
    return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
  });
  
  return (
    <div>
      <div className="flex justify-end mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest')}
          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
      
      <div className="space-y-4">
        {sortedOpportunities.map((opportunity) => (
          <div 
            key={`${opportunity.id}-${opportunity.viewedAt}`} 
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="relative h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                  {renderOrganizationLogo(
                    opportunity.organization.logo,
                    opportunity.organization.name
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <Link href={`/opportunities/${opportunity.id}`} className="hover:underline">
                  <h3 className="text-base font-medium text-gray-900 truncate">
                    {opportunity.title}
                  </h3>
                </Link>
                
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
                  <Link 
                    href={`/community/${opportunity.organization.id}`}
                    className="hover:text-blue-600"
                  >
                    {opportunity.organization.name}
                  </Link>
                  <span>•</span>
                  <span>{opportunity.category.name}</span>
                </div>
                
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  <span>Viewed on {format(new Date(opportunity.viewedAt), 'PPP')}</span>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Link 
                  href={`/opportunities/${opportunity.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 