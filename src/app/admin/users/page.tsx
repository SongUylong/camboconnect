"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/ui/user-avatar";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { 
  Plus, 
  User, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Upload,
  X,
  Save,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";

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
  image?: string | null;
}

interface EditUserFormData {
  id: string;
  name: string;
  image: string | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "USER", status: "ACTIVE" });
  const [editUser, setEditUser] = useState<EditUserFormData>({ id: "", name: "", image: null });
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
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
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
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
      toast.success("User status updated successfully");
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleAddUser = async () => {
    try {
      // Validate form
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast.error("Please fill in all required fields");
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) throw new Error("Failed to create user");
      
      const createdUser = await response.json();
      setUsers((prev) => [...prev, createdUser]);
      setNewUser({ name: "", email: "", password: "", role: "USER", status: "ACTIVE" });
      setIsAddUserDialogOpen(false);
      toast.success("User created successfully");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    }
  };

  const openEditDialog = (user: User) => {
    setEditUser({
      id: user.id,
      name: user.name,
      image: user.image || null
    });
    setImagePreview(user.image || null);
    setIsEditUserDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);
    setProfileImageFile(file);

    try {
      // Create a local preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error creating image preview:", error);
      toast.error("Failed to preview image");
      setProfileImageFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      // First update basic user info
      const response = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editUser.name
        }),
      });

      if (!response.ok) throw new Error("Failed to update user");

      // If there's a new profile image, upload it
      if (profileImageFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", profileImageFile);
        
        const uploadResponse = await fetch(`/api/admin/users/${editUser.id}/image`, {
          method: "POST",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.message || "Failed to upload image");
        }
        
        const data = await uploadResponse.json();
        setImagePreview(data.user.profileImage);
      }
      
      // Update the users list after successful update
      setUsers(prev => 
        prev.map(user => 
          user.id === editUser.id 
            ? { 
                ...user, 
                name: editUser.name, 
                image: profileImageFile ? imagePreview : user.image 
              } 
            : user
        )
      );
      
      setIsEditUserDialogOpen(false);
      setProfileImageFile(null);
      setIsUploading(false);
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
      setIsUploading(false);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleteInProgress(true);
      const response = await fetch(`/api/admin/users/${userToDelete.id}?force=true`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete user");
      
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setDeleteInProgress(false);
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
      <MainLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-muted-foreground">Please sign in to manage users</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-2"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddUserDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
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
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm py-12 text-center text-gray-500">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                        <UserAvatar 
                          user={user} 
                          className="h-12 w-12" 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-medium">{user.name}</h3>
                        <Badge variant={user.status === "ACTIVE" ? "success" : user.status === "SUSPENDED" ? "destructive" : "warning"}>
                          {user.status}
                        </Badge>
                        <Badge variant="secondary">{user.role}</Badge>
                        {user.emailVerified && <Badge variant="outline">Verified Email</Badge>}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
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
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(user)}
                      className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Select
                      options={[
                        { value: "USER", label: "Set as User" },
                        { value: "ADMIN", label: "Set as Admin" },
                        { value: "ORGANIZATION", label: "Set as Organization" },
                      ]}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as User["role"])}
                      className="w-36"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDeleteDialog(user)}
                      className="border-red-200 bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                  Min 8 characters
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium">Role</label>
              <Select
                id="role"
                options={[
                  { value: "USER", label: "User" },
                  { value: "ADMIN", label: "Admin" },
                  { value: "ORGANIZATION", label: "Organization" },
                ]}
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select
                id="status"
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "SUSPENDED", label: "Suspended" },
                  { value: "PENDING", label: "Pending" },
                ]}
                value={newUser.status}
                onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
              <Input
                id="edit-name"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="profile-image" className="text-sm font-medium block mb-2">Profile Image</label>
              <div className="flex flex-col items-center gap-4">
                <div className="relative cursor-pointer group">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile preview" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Overlay that appears on hover */}
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="text-white text-xs font-medium">Change</span>
                    </div>
                    
                    {/* Loading spinner */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                        <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                        setProfileImageFile(null);
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 z-10"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                <div>
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2"
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    <span>Upload Image</span>
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    JPEG, PNG, GIF or WebP (max 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditUserDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handleUpdateUser}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Confirm User Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Are you sure you want to delete user <span className="font-semibold">{userToDelete?.name}</span>?</p>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
              <p className="font-semibold flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" /> 
                Warning
              </p>
              <p className="mt-1">This will delete all user data including profile, applications, and other associated records. This action cannot be undone.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteInProgress}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser} 
              disabled={deleteInProgress}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteInProgress ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Forever
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
