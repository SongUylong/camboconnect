"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function DeleteOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [organizationName, setOrganizationName] = useState("Cambodia Tech Association"); // In a real app, fetch this
  
  const isConfirmationValid = confirmText === organizationName;
  
  const handleCancel = () => {
    router.push(`/admin/organizations/${organizationId}`);
  };
  
  const handleDelete = async () => {
    if (!isConfirmationValid) return;
    
    try {
      setIsLoading(true);
      
      // In a real app, call API to delete organization
      // await fetch(`/api/admin/organizations/${organizationId}`, {
      //   method: 'DELETE',
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Organization deleted successfully");
      router.push("/admin/organizations");
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error("Failed to delete organization");
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container max-w-md mx-auto py-12">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => router.push(`/admin/organizations/${organizationId}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Organization
      </Button>
      
      <Card className="p-6">
        <div className="flex items-center gap-3 text-destructive mb-6">
          <AlertTriangle className="h-6 w-6" />
          <h1 className="text-xl font-bold">Delete Organization</h1>
        </div>
        
        <p className="mb-4">
          Are you sure you want to delete <strong>{organizationName}</strong>? This action cannot be undone.
        </p>
        
        <div className="bg-muted p-4 rounded-md mb-6">
          <p className="text-sm mb-2">This will:</p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>Permanently delete the organization profile</li>
            <li>Remove all members from the organization</li>
            <li>Delete all opportunities created by this organization</li>
            <li>Remove all associated data and content</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Type <strong>{organizationName}</strong> to confirm:
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={organizationName}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Organization"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
