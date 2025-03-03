import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CommunityDetailClient } from "@/components/community/community-detail-client";
import { MainLayout } from "@/components/layout/main-layout";

interface OrganizationParams {
  id: string;
}

export default async function OrganizationPage({
  params,
  searchParams,
}: {
  params: OrganizationParams;
  searchParams: { category?: string; status?: string };
}) {
  // Fetch organization with opportunities count
  const organization = await db.organization.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          followers: true,
          opportunities: true,
        },
      },
    },
  });

  if (!organization) {
    notFound();
  }

  // Build query for opportunities
  const whereClause: any = {
    organizationId: organization.id,
  };

  if (searchParams.category) {
    whereClause.categoryId = searchParams.category;
  }

  if (searchParams.status) {
    whereClause.status = searchParams.status;
  }

  // Fetch organization's opportunities
  const opportunities = await db.opportunity.findMany({
    where: whereClause,
    orderBy: {
      deadline: "asc",
    },
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

  // Fetch only the categories that this organization has opportunities for
  const organizationCategories = await db.category.findMany({
    where: {
      opportunities: {
        some: {
          organizationId: organization.id,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Transform the organization data for the client component
  const organizationData = {
    id: organization.id,
    name: organization.name,
    description: organization.description,
    logo: organization.logo,
    website: organization.website,
    followerCount: organization._count.followers,
    opportunityCount: organization._count.opportunities,
    history: organization.history,
    termsOfService: organization.termsOfService,
  };

  // Add default properties to opportunities for the client component
  const opportunitiesWithDefaults = opportunities.map(opportunity => {
    // Ensure all required properties exist
    return {
      id: opportunity.id,
      title: opportunity.title,
      shortDescription: opportunity.shortDescription,
      deadline: opportunity.deadline,
      status: opportunity.status as "OPENING_SOON" | "ACTIVE" | "CLOSING_SOON" | "CLOSED",
      visitCount: typeof opportunity.visitCount === 'number' ? opportunity.visitCount : 0,
      isPopular: false,
      isNew: false,
      isBookmarked: false,
      // Ensure organization data is properly structured
      organization: {
        id: opportunity.organization?.id || organization.id,
        name: opportunity.organization?.name || organization.name,
        logo: opportunity.organization?.logo || organization.logo
      },
      // Ensure category data is properly structured
      category: {
        id: opportunity.category?.id || "",
        name: opportunity.category?.name || "Uncategorized"
      }
    };
  });

  return (
    <MainLayout>
      <CommunityDetailClient
        organization={organizationData}
        initialOpportunities={opportunitiesWithDefaults}
        initialCategories={organizationCategories}
        initialCategoryFilter={searchParams.category || ""}
        initialStatusFilter={searchParams.status || ""}
      />
    </MainLayout>
  );
}