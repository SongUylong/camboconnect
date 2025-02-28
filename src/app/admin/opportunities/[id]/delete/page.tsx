"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function DeleteOpportunityPage() {
  const router = useRouter();
  const params = useParams();
  const opportunityId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [opportunityTitle, setOpportunityTitle] = useState("");
  
  useEffect(() => {
    const fetchOpportunityData = async () => {
      try {
        setIsLoading(true);
        // In a real app, fetch opportunity data from API
        // const response = await fetch(`/api/admin/opportunities/${opportunityId}`);
        // const data = await response.json();
        // setOpportunityTitle(data.title);
        
        // Mock data for demonstration
        setOpportunityTitle("Web Development Workshop");
      } catch (error) {
        console.error("Error fetching opportunity data:", error);
        toast.error("Failed to load opportunity data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOpportunityData();
  }, [opportunityId]);
  
  const handleDelete = async () => {
    if (confirmText !== opportunityTitle) {
      toast.error("Please type the opportunity title correctly to confirm deletion");
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // In a real app, call API to delete the opportunity
      // await fetch(`/api/admin/opportunities/${opportunityId}`, {
      //   method: "DELETE",
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Opportunity deleted successfully");
      router.push("/admin/opportunities");
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      toast.error("Failed to delete opportunity");
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">Loading opportunity data...</div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Delete Opportunity</h1>
      </div>
      
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-destructive/10 p-2 rounded-full">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Are you sure you want to delete this opportunity?</h2>
            <p className="text-muted-foreground mb-2">
              You are about to delete the opportunity: <span className="font-medium">{opportunityTitle}</span>
            </p>
            <p className="text-muted-foreground">
              This action cannot be undone. All data associated with this opportunity, including applications and activity history, will be permanently removed.
            </p>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              To confirm, type the opportunity title: <span className="font-semibold">{opportunityTitle}</span>
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type the opportunity title"
              className="max-w-md"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmText !== opportunityTitle || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Opportunity"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
