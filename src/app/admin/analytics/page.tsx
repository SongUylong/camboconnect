"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  users: {
    total: number;
    activeThisMonth: number;
    newThisMonth: number;
    growth: number;
  };
  opportunities: {
    total: number;
    active: number;
    applications: number;
    successRate: number;
  };
  organizations: {
    total: number;
    verified: number;
    newThisMonth: number;
  };
  engagement: {
    messagesSent: number;
    averageResponseTime: number;
    activeChats: number;
  };
}

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics");
        if (!response.ok) throw new Error("Failed to fetch analytics");
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchAnalytics();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view analytics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Platform Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{analytics.users.total}</div>
              <Badge variant={analytics.users.growth >= 0 ? "success" : "destructive"}>
                {analytics.users.growth >= 0 ? "+" : ""}{analytics.users.growth}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.users.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        {/* Opportunity Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.opportunities.active}</div>
            <div className="flex items-center mt-2">
              <div className="text-xs text-muted-foreground">
                {analytics.opportunities.applications} applications
              </div>
              <div className="mx-2 text-muted-foreground">•</div>
              <div className="text-xs text-muted-foreground">
                {analytics.opportunities.successRate}% success rate
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.organizations.total}</div>
            <div className="flex items-center mt-2">
              <div className="text-xs text-muted-foreground">
                {analytics.organizations.verified} verified
              </div>
              <div className="mx-2 text-muted-foreground">•</div>
              <div className="text-xs text-muted-foreground">
                {analytics.organizations.newThisMonth} new this month
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.engagement.messagesSent}</div>
            <div className="flex items-center mt-2">
              <div className="text-xs text-muted-foreground">
                {analytics.engagement.activeChats} active chats
              </div>
              <div className="mx-2 text-muted-foreground">•</div>
              <div className="text-xs text-muted-foreground">
                {analytics.engagement.averageResponseTime}m avg response
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add more sections for charts and detailed analytics */}
    </div>
  );
} 