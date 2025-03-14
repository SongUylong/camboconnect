"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Pagination } from "@/components/ui/pagination";

interface Opportunity {
  id: string;
  title: string;
  shortDescription: string;
  deadline: Date;
  status: "OPENING_SOON" | "ACTIVE" | "CLOSING_SOON" | "CLOSED";
  visitCount: number;
  isPopular: boolean;
  isNew: boolean;
  isBookmarked?: boolean;
  organization: {
    id: string;
    name: string;
    logo: string | null;
  };
  category: {
    id: string;
    name: string;
  };
}

interface OpportunitiesClientProps {
  initialOpportunities: Opportunity[];
  initialTotalPages: number;
  initialCurrentPage: number;
}

export function OpportunitiesClient({
  initialOpportunities,
  initialTotalPages,
  initialCurrentPage,
}: OpportunitiesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/opportunities?${searchParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch opportunities');
        
        const data = await response.json();
        setOpportunities(data.opportunities);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900">No opportunities found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {opportunities.map((opportunity) => (
          <OpportunityCard 
            key={opportunity.id} 
            opportunity={{
              ...opportunity,
              deadline: new Date(opportunity.deadline as unknown as string),
            }} 
          />
        ))}
      </div>
      
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
      />
    </>
  );
} 