import { MainLayout } from "@/components/layout/main-layout";
import { db } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Bookmark, Calendar, ExternalLink, Globe, Info, Mail, Users } from "lucide-react";
import { BookmarkButton } from "@/components/opportunities/bookmark-button";
import { PreviousParticipants } from "@/components/opportunities/previous-participants";
import ApplicationStatusForm from "@/components/opportunities/application-status-form";
import { ApplicationCheckModal } from "@/components/opportunities/application-check-modal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function OpportunityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  if (!session) {
    // Redirect to login page with callback URL to return after login
    redirect(`/login?callbackUrl=/opportunities/${params.id}`);
  }

  // Increment view count - in a real app, this would use a server action
  try {
    await db.opportunity.update({
      where: { id: params.id },
      data: { visitCount: { increment: 1 } },
    });
  } catch (error) {
    console.error("Failed to increment view count:", error);
  }

  // Fetch opportunity details
  const opportunity = await db.opportunity.findUnique({
    where: { id: params.id },
    include: {
      organization: true,
      category: true,
      participations: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              privacyLevel: true,
            },
          },
        },
        where: {
          isPublic: true,
        },
        take: 10,
      },
    },
  });

  if (!opportunity) {
    notFound();
  }

  // Format deadline date
  const deadlineDate = format(new Date(opportunity.deadline), "MMMM d, yyyy");
  
  // Format start and end dates if they exist
  const startDate = opportunity.startDate 
    ? format(new Date(opportunity.startDate), "MMMM d, yyyy") 
    : null;
  const endDate = opportunity.endDate 
    ? format(new Date(opportunity.endDate), "MMMM d, yyyy") 
    : null;

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

  return (
    <MainLayout>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
                <BookmarkButton opportunityId={opportunity.id} />
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
                <h2 className="text-xl font-semibold text-gray-900">Previous Participants</h2>
                <div className="mt-4">
                  <PreviousParticipants participations={opportunity.participations} />
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
                      externalLink={opportunity.externalLink}
                    />
                    <ApplicationCheckModal 
                      opportunityId={opportunity.id}
                      opportunityTitle={opportunity.title}
                      organizationName={opportunity.organization.name}
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
                        <time dateTime={opportunity.deadline.toISOString()}>{deadlineDate}</time>
                      </dd>
                    </div>
                    {startDate && endDate && (
                      <div className="flex items-start">
                        <dt className="flex-shrink-0">
                          <Calendar className="h-5 w-5 text-gray-500" />
                        </dt>
                        <dd className="ml-2">
                          <span className="font-medium text-gray-900">Duration:</span><br />
                          <time dateTime={opportunity.startDate?.toISOString() || ""}>{startDate}</time>
                          {" to "}
                          <time dateTime={opportunity.endDate?.toISOString() || ""}>{endDate}</time>
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
                        <span className="text-gray-500">{opportunity.participations.length} past participants</span>
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
    </MainLayout>
  );
}