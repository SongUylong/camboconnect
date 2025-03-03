import { MainLayout } from "@/components/layout/main-layout";
import { db } from "@/lib/prisma";
import { CommunityClient } from "@/components/community/community-client";
import { headers } from "next/headers";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { q?: string; layout?: string };
}) {
  // Build query conditions based on search params
  const whereClause: any = {};

  if (searchParams.q) {
    whereClause.OR = [
      {
        name: {
          contains: searchParams.q,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: searchParams.q,
          mode: "insensitive",
        },
      },
    ];
  }

  // Fetch organizations
  const organizations = await db.organization.findMany({
    where: whereClause,
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          followers: true,
          opportunities: true,
        },
      },
    },
  });

  // Transform for the component
  const organizationsWithCounts = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    description: org.description,
    logo: org.logo,
    website: org.website,
    history: org.history,
    termsOfService: org.termsOfService,
    followerCount: org._count.followers,
    opportunityCount: org._count.opportunities,
  }));

  // Always use grid layout as the default, regardless of what's in the URL
  // The client component will handle showing only grid view on mobile
  const initialLayout = searchParams.layout || "grid";

  return (
    <MainLayout>
      <CommunityClient 
        initialOrganizations={organizationsWithCounts} 
        initialSearchQuery={searchParams.q || ""} 
        initialLayout={initialLayout} 
      />
    </MainLayout>
  );
}