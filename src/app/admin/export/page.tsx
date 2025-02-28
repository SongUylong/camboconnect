"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ExportJob {
  id: string;
  type: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
}

export default function AdminExportPage() {
  const { data: session } = useSession();
  const [selectedType, setSelectedType] = useState<string>("users");
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);

  const exportTypes = [
    { value: "users", label: "Users Data" },
    { value: "opportunities", label: "Opportunities Data" },
    { value: "organizations", label: "Organizations Data" },
    { value: "applications", label: "Applications Data" },
    { value: "messages", label: "Messages Data" },
    { value: "analytics", label: "Analytics Data" },
  ];

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType }),
      });

      if (!response.ok) throw new Error("Failed to start export");
      
      const job = await response.json();
      setJobs((prev) => [job, ...prev]);
    } catch (error) {
      console.error("Error starting export:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ExportJob["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "PROCESSING":
        return <Badge variant="warning">Processing</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!session) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Please sign in to export data</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Export Data</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Start New Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select
                options={exportTypes}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              />
            </div>
            <Button
              onClick={handleExport}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? "Starting..." : "Export"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No export jobs yet
              </p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">
                        {exportTypes.find((t) => t.value === job.type)?.label}
                      </h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Started {new Date(job.createdAt).toLocaleString()}
                    </p>
                    {job.completedAt && (
                      <p className="text-sm text-muted-foreground">
                        Completed {new Date(job.completedAt).toLocaleString()}
                      </p>
                    )}
                    {job.error && (
                      <p className="text-sm text-destructive mt-1">
                        Error: {job.error}
                      </p>
                    )}
                  </div>
                  {job.downloadUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(job.downloadUrl)}
                    >
                      Download
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
