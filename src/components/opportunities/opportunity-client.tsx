'use client';

import { format } from "date-fns";
import Link from "next/link";
import { Bookmark, Calendar, ExternalLink, Globe, Info, Mail, Users, ArrowLeft, AlertCircle, RefreshCcw } from "lucide-react";
import { BookmarkButton } from "@/components/opportunities/bookmark-button";
import { PreviousParticipants } from "@/components/opportunities/previous-participants";
import { ApplicationStatusForm } from "@/components/opportunities/application-status-form";
import { BackButton } from "@/components/ui/back-button";
import { ViewCounter } from "@/components/opportunities/view-counter";
import { useOpportunity, useBookmarkOpportunity, useUnbookmarkOpportunity } from "@/hooks/use-opportunities";
import { Loader2 } from "lucide-react";
import { User } from "@prisma/client";
import { useLoading } from "@/hooks/use-loading";

interface OpportunityClientProps {
  initialOpportunity: {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    deadline: Date;
    status: "OPENING_SOON" | "ACTIVE" | "CLOSING_SOON" | "CLOSED";
    visitCount: number;
    isPopular: boolean;
    isNew: boolean;
    organization: {
      id: string;
      name: string;
      logo: string | null;
    };
    category: {
      id: string;
      name: string;
    };
    participants?: User[];
    participantsCount?: number;
  };
}

export function OpportunityClient({ initialOpportunity }: OpportunityClientProps) {
  const { 
    data: opportunity, 
    isLoading: isQueryLoading,
    isError,
    error,
    refetch 
  } = useOpportunity(initialOpportunity.id);
  
  // Use our custom loading hook to integrate with the global loading indicator
  // We use the opportunity query key to only track loading for this specific query
  // Pass the initialOpportunity to prevent loading flash when we already have data
  const { isLoading } = useLoading({ 
    queryKey: ['opportunities', initialOpportunity.id],
    // Don't show loading if we already have the initial data
    initialData: initialOpportunity 
  });
  
  const bookmarkMutation = useBookmarkOpportunity();
  const unbookmarkMutation = useUnbookmarkOpportunity();

  // Error state component
  const ErrorState = ({ error, onRetry }: { error: Error | null, onRetry: () => void }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error Loading Opportunity</h3>
          </div>
          <p className="text-red-700 mb-4">{error?.message || 'An unexpected error occurred. Please try again.'}</p>
          <div className="flex space-x-4">
            <button
              onClick={onRetry}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </button>
            <Link href="/opportunities" className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Opportunities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state component
  const LoadingState = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-600">Loading opportunity details...</p>
      </div>
    </div>
  );

  // Handle bookmark error
  const handleBookmarkError = (error: Error) => {
    // You could use a toast notification library here
    console.error('Failed to bookmark:', error);
    // Show error message to user
    alert(error.message || 'Failed to bookmark opportunity. Please try again.');
  };

  // Handle bookmark
  const handleBookmark = async () => {
    if (!opportunity) return;

    try {
      if (opportunity.isBookmarked) {
        await unbookmarkMutation.mutateAsync(opportunity.id);
      } else {
        await bookmarkMutation.mutateAsync(opportunity.id);
      }
    } catch (error) {
      handleBookmarkError(error as Error);
    }
  };

  // Helper function to get status badge styling
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

  if (isError) {
    return <ErrorState error={error as Error} onRetry={refetch} />;
  }

  // Only show loading state if we don't have data yet
  // This prevents the loading indicator from showing when data is already cached
  if (isLoading && !opportunity) {
    return <LoadingState />;
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Opportunity not found</h1>
          <p className="mt-2 text-gray-600">
            The opportunity you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/opportunities" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  // Format dates
  const deadlineDate = format(new Date(opportunity.deadline), "MMMM d, yyyy");
  const startDate = opportunity.startDate 
    ? format(new Date(opportunity.startDate), "MMMM d, yyyy") 
    : null;
  const endDate = opportunity.endDate 
    ? format(new Date(opportunity.endDate), "MMMM d, yyyy") 
    : null;

  return (
    <div className="bg-white">
      <ViewCounter opportunityId={opportunity.id} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex flex-wrap items-start justify-between">
            <div className="flex-1 min-w-0 mb-4 sm:mb-0">
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(opportunity.status)}`}>
                  {opportunity.status.replace("_", " ")}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {opportunity.category.name}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                {opportunity.title}
              </h1>
              <div className="mt-1">
                <Link 
                  href={`/community/${opportunity.organization.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {opportunity.organization.name}
                </Link>
              </div>
            </div>
            <div className="flex mt-2 sm:mt-0">
              <BookmarkButton 
                opportunityId={opportunity.id}
                isBookmarked={opportunity.isBookmarked}
                onBookmark={handleBookmark}
                onUnbookmark={handleBookmark}
              />
              <Link 
                href="#apply" 
                className="ml-3 btn btn-primary"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900">Description</h2>
              <div className="mt-4 prose prose-blue max-w-none">
                <p>{opportunity.description}</p>
              </div>
            </section>

            {/* Eligibility */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Eligibility Requirements</h2>
              <div className="mt-4 prose prose-blue max-w-none">
                <p>{opportunity.eligibility}</p>
              </div>
            </section>

            {/* Application Process */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Application Process</h2>
              <div className="mt-4 prose prose-blue max-w-none">
                <p>{opportunity.applicationProcess}</p>
              </div>
            </section>

            {/* Benefits */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Benefits</h2>
              <div className="mt-4 prose prose-blue max-w-none">
                <p>{opportunity.benefits}</p>
              </div>
            </section>

            {/* Previous Participants */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Participants</h2>
              <div className="mt-4">
                <PreviousParticipants 
                  participants={opportunity.participants || []} 
                  participantsCount={opportunity.participantsCount || 0} 
                />
              </div>
            </section>

            {/* Application Section */}
            <section id="apply" className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Apply for this Opportunity</h2>
              {opportunity.status === "CLOSED" ? (
                <div className="mt-4 bg-red-50 p-4 rounded-md">
                  <p className="text-red-700">
                    This opportunity is no longer accepting applications.
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <ApplicationStatusForm 
                    opportunityId={opportunity.id}
                    onSuccess={() => {
                      // Optionally handle success
                    }}
                  />
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              {/* Key dates */}
              <div>
                <h3 className="font-medium text-gray-900">Key Dates</h3>
                <dl className="mt-2 space-y-3">
                  <div className="flex items-start">
                    <dt className="flex-shrink-0">
                      <Calendar className="h-5 w-5 text-gray-500" />
                    </dt>
                    <dd className="ml-2">
                      <span className="font-medium text-gray-900">Application Deadline:</span><br />
                      <time dateTime={new Date(opportunity.deadline).toISOString()}>{deadlineDate}</time>
                    </dd>
                  </div>
                  {startDate && endDate && (
                    <div className="flex items-start">
                      <dt className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-gray-500" />
                      </dt>
                      <dd className="ml-2">
                        <span className="font-medium text-gray-900">Duration:</span><br />
                        <time dateTime={new Date(opportunity.startDate || '').toISOString()}>{startDate}</time>
                        {" to "}
                        <time dateTime={new Date(opportunity.endDate || '').toISOString()}>{endDate}</time>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">Contact Information</h3>
                <div className="mt-2 flex items-start">
                  <Mail className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <span className="ml-2 text-gray-500">{opportunity.contactInfo}</span>
                </div>
              </div>

              {/* Organization Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">About the Organization</h3>
                <div className="mt-2">
                  <Link 
                    href={`/community/${opportunity.organization.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {opportunity.organization.name}
                  </Link>
                  {opportunity.organization.website && (
                    <div className="mt-2 flex items-start">
                      <Globe className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <a 
                        href={opportunity.organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800 truncate"
                      >
                        {opportunity.organization.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">Stats</h3>
                <dl className="mt-2 space-y-3">
                  <div className="flex items-start">
                    <dt className="flex-shrink-0">
                      <Users className="h-5 w-5 text-gray-500" />
                    </dt>
                    <dd className="ml-2">
                      <span className="text-gray-500">{opportunity.participantsCount || 0} past participants</span>
                    </dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="flex-shrink-0">
                      <Info className="h-5 w-5 text-gray-500" />
                    </dt>
                    <dd className="ml-2">
                      <span className="text-gray-500">{opportunity.visitCount} views</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 