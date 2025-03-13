import { MainLayout } from "@/components/layout/main-layout";
import { CommunityDetailClient } from "@/components/community/community-detail-client";
import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { OpportunityStatus } from "@/types";

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

  // Convert opportunities to the expected type with proper defaults
  const opportunitiesWithDefaults = opportunities.map(opportunity => ({
    id: opportunity.id,
    title: opportunity.title,
    description: opportunity.description || "",
    shortDescription: opportunity.shortDescription || "",
    eligibility: opportunity.eligibility || "",
    applicationProcess: opportunity.applicationProcess || "",
    benefits: opportunity.benefits || "",
    contactInfo: opportunity.contactInfo || "",
    externalLink: opportunity.externalLink || null,
    deadline: opportunity.deadline,
    startDate: opportunity.startDate || null,
    endDate: opportunity.endDate || null,
    createdAt: opportunity.createdAt || new Date(),
    updatedAt: opportunity.updatedAt || new Date(),
    status: (opportunity.status as OpportunityStatus) || OpportunityStatus.ACTIVE,
    categoryId: opportunity.categoryId || "",
    visitCount: typeof opportunity.visitCount === 'number' ? opportunity.visitCount : 0,
    isPopular: false,
    isNew: false,
    isBookmarked: false,
    organizationId: opportunity.organizationId || organization.id,
    organization: {
      id: opportunity.organization?.id || organization.id,
      name: opportunity.organization?.name || organization.name,
      logo: opportunity.organization?.logo || organization.logo
    },
    category: {
      id: opportunity.category?.id || "",
      name: opportunity.category?.name || "Uncategorized"
    }
  }));

  return (
    <MainLayout>
      <CommunityDetailClient
        organization={organizationData}
        initialOpportunities={opportunitiesWithDefaults as any}
        initialCategories={organizationCategories}
        initialCategoryFilter={searchParams.category || ""}
        initialStatusFilter={searchParams.status || ""}
      />
    </MainLayout>
  );
}