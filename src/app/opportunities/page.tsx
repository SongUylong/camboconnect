import { MainLayout } from "@/components/layout/main-layout";
import { OpportunitiesClient } from "@/components/opportunities/opportunities-client";
import { db } from "@/lib/prisma";

// Remove force-dynamic and set appropriate revalidation
export const revalidate = 30;

export default async function OpportunitiesPage() {
  // Fetch categories for filter
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <MainLayout>
      <OpportunitiesClient initialCategories={categories} />
    </MainLayout>
  );
}