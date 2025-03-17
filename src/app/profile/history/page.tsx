"use client";

import { useState } from 'react';
import { MainLayout } from "@/components/layout/main-layout";
import { ViewedOpportunitiesList } from "@/components/profile/viewed-opportunities-list";
import { useViewedOpportunities } from "@/hooks/use-viewed-opportunities";
import { Pagination } from "@/components/ui/pagination";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Eye, Clock } from "lucide-react";

export default function ViewHistoryPage() {
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Redirect if not logged in
  if (status === "unauthenticated") {
    redirect("/login");
  }
  
  // Fetch viewed opportunities
  const { 
    data: viewedOpportunitiesData, 
    isLoading: isLoadingViewed,
    error: viewedError
  } = useViewedOpportunities(itemsPerPage, currentPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Browsing History</h1>
        
        <Tabs defaultValue="viewed" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="viewed" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Viewed Opportunities</span>
            </TabsTrigger>
            {/* Can add more tabs in the future, like "Recent Searches" */}
          </TabsList>
          
          <TabsContent value="viewed">
            <Card className="p-6">
              <ViewedOpportunitiesList 
                opportunities={viewedOpportunitiesData?.opportunities || []}
                isLoading={isLoadingViewed}
              />
              
              {viewedOpportunitiesData && viewedOpportunitiesData.pageCount > 1 && (
                <div className="mt-6">
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={viewedOpportunitiesData.pageCount} 
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 