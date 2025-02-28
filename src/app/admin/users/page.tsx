"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "ORGANIZATION";
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  emailVerified: boolean;
  createdAt: Date;
  lastLogin?: Date;
  organizationCount: number;
  applicationCount: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchUsers();
    }
  }, [session]);

  const handleRoleChange = async (id: string, role: User["role"]) => {
    try {
      const response = await fetch(`/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error("Failed to update user role");

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, role } : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleStatusChange = async (id: string, status: User["status"]) => {
    try {
      const response = await fetch(`/api/admin/users/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update user status");

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, status } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!session) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Please sign in to manage users</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Users</h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select
              options={[
                { value: "all", label: "All Roles" },
                { value: "USER", label: "User" },
                { value: "ADMIN", label: "Admin" },
                { value: "ORGANIZATION", label: "Organization" },
              ]}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-48"
            />
            <Select
              options={[
                { value: "all", label: "All Status" },
                { value: "ACTIVE", label: "Active" },
                { value: "SUSPENDED", label: "Suspended" },
                { value: "PENDING", label: "Pending" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No users found
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:bg-accent/5">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium hover:underline cursor-pointer" onClick={() => router.push(`/admin/users/${user.id}`)}>
                      {user.name}
                    </h3>
                    <Badge variant={user.status === "ACTIVE" ? "success" : user.status === "SUSPENDED" ? "destructive" : "warning"}>
                      {user.status}
                    </Badge>
                    <Badge variant="secondary">{user.role}</Badge>
                    {user.emailVerified && <Badge variant="outline">Verified Email</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{user.email}</p>
                    <p>
                      {user.organizationCount} organizations • {user.applicationCount} applications
                    </p>
                    <p>
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                      {user.lastLogin && ` • Last login ${new Date(user.lastLogin).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    options={[
                      { value: "USER", label: "Set as User" },
                      { value: "ADMIN", label: "Set as Admin" },
                      { value: "ORGANIZATION", label: "Set as Organization" },
                    ]}
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as User["role"])}
                  />
                  <Select
                    options={[
                      { value: "ACTIVE", label: "Set Active" },
                      { value: "SUSPENDED", label: "Suspend" },
                      { value: "PENDING", label: "Set Pending" },
                    ]}
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value as User["status"])}
                  />
                  <Button variant="outline" onClick={() => router.push(`/admin/users/${user.id}`)}>
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
