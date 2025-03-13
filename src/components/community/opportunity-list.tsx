import React from 'react';
import type { Opportunity } from '@/types';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { Loading } from '@/components/ui/loading';

interface OpportunityListProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  layout: 'grid' | 'list';
  onBookmark: (opportunityId: string, isBookmarked: boolean) => Promise<void>;
}

export function OpportunityList({
  opportunities,
  isLoading,
  layout,
  onBookmark,
}: OpportunityListProps) {
  if (isLoading) {
    return <Loading />;
  }

  if (!opportunities.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No opportunities found</p>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            variant="compact"
            onBookmark={(isBookmarked) => onBookmark(opportunity.id, isBookmarked)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {opportunities.map((opportunity) => (
        <OpportunityCard
          key={opportunity.id}
          opportunity={opportunity}
          onBookmark={(isBookmarked) => onBookmark(opportunity.id, isBookmarked)}
        />
      ))}
    </div>
  );
} 