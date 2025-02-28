import { MainLayout } from "@/components/layout/main-layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import OpportunityForm from "@/components/admin/opportunity-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewOpportunityPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session || !session.user.isAdmin) {
    redirect("/login");
  }

  // Fetch categories and organizations for the form
  const [categories, organizations] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
    db.organization.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin/opportunities" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Opportunities
          </Link>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Opportunity</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details below to create a new opportunity
          </p>
        </div>
        
        <OpportunityForm
          categories={categories}
          organizations={organizations}
        />
      </div>
    </MainLayout>
  );
}