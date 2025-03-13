import { MainLayout } from "@/components/layout/main-layout";
import { OpportunityClient } from "@/components/opportunities/opportunity-client";
import { db } from "@/lib/prisma";

export const revalidate = 30;

export default async function OpportunityPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch initial data for the opportunity
  const opportunity = await db.opportunity.findUnique({
    where: { id: params.id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      category: true,
    },
  });

  if (!opportunity) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Opportunity not found</h1>
            <p className="mt-2 text-gray-600">
              The opportunity you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <OpportunityClient initialOpportunity={opportunity} />
    </MainLayout>
  );
}