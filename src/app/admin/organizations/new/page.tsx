import { MainLayout } from "@/components/layout/main-layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrganizationForm from "@/components/admin/organization-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewOrganizationPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session || !session.user.isAdmin) {
    redirect("/login");
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin/organizations" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Organizations
          </Link>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Organization</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details below to create a new organization
          </p>
        </div>
        
        <OrganizationForm />
      </div>
    </MainLayout>
  );
}
