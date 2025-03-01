"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState, useEffect } from "react";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PrivacySettingsPage() {
  const [user, setUser] = useState<{
    id: string;
    privacyLevel: string;
    twoFactorEnabled: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [router]);

  // Handle privacy level update
  const updatePrivacyLevel = async (privacyLevel: string) => {
    try {
      const response = await fetch("/api/user/update-privacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ privacyLevel }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update privacy settings");
      }
      
      // Update local state
      setUser(prev => prev ? { ...prev, privacyLevel } : null);
      toast.success("Privacy settings updated successfully");
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings. Please try again.");
    }
  };

  // Handle 2FA toggle
  const toggle2FA = async (enable: boolean) => {
    try {
      const endpoint = enable ? "/api/user/enable-2fa" : "/api/user/disable-2fa";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${enable ? "enable" : "disable"} 2FA`);
      }
      
      // Update local state
      setUser(prev => prev ? { ...prev, twoFactorEnabled: enable } : null);
      toast.success(`Two-factor authentication ${enable ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.error(`Error ${enable ? "enabling" : "disabling"} 2FA:`, error);
      toast.error(`Failed to ${enable ? "enable" : "disable"} 2FA. Please try again.`);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/profile" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Privacy Settings</h1>
            </div>
            <p className="mt-2 text-gray-600">
              Manage your privacy preferences and security settings.
            </p>
          </div>
          
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Visibility</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="public"
                    name="privacyLevel"
                    type="radio"
                    value="PUBLIC"
                    checked={user.privacyLevel === "PUBLIC"}
                    onChange={() => updatePrivacyLevel("PUBLIC")}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="public" className="font-medium text-gray-700">Public Profile</label>
                  <p className="text-gray-500">Anyone can see your profile and participation history.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="friends-only"
                    name="privacyLevel"
                    type="radio"
                    value="FRIENDS_ONLY"
                    checked={user.privacyLevel === "FRIENDS_ONLY"}
                    onChange={() => updatePrivacyLevel("FRIENDS_ONLY")}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="friends-only" className="font-medium text-gray-700">Friends Only</label>
                  <p className="text-gray-500">Only friends can see your detailed profile and participation history.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="private"
                    name="privacyLevel"
                    type="radio"
                    value="ONLY_ME"
                    checked={user.privacyLevel === "ONLY_ME"}
                    onChange={() => updatePrivacyLevel("ONLY_ME")}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="private" className="font-medium text-gray-700">Private Profile</label>
                  <p className="text-gray-500">Only you can see your detailed profile and participation history.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h2>
              
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full ${user.twoFactorEnabled ? "bg-green-500" : "bg-gray-300"} mr-2`}></div>
                <span className="text-gray-600">
                  {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              
              <p className="mt-2 text-sm text-gray-500">
                {user.twoFactorEnabled 
                  ? "Two-factor authentication is enabled. You will receive a verification code via email when signing in."
                  : "Enable two-factor authentication to add an extra layer of security to your account."}
              </p>
              
              {!user.twoFactorEnabled && (
                <div className="mt-4">
                  <button
                    onClick={() => toggle2FA(true)}
                    className="btn btn-outline btn-sm"
                  >
                    Enable 2FA
                  </button>
                </div>
              )}
              
              {user.twoFactorEnabled && (
                <div className="mt-4">
                  <button
                    onClick={() => toggle2FA(false)}
                    className="btn btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Disable 2FA
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 