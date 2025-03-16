"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Users, Shield, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type PrivacyLevel = "PUBLIC" | "FRIENDS_ONLY" | "ONLY_ME";

interface PrivacySettings {
  educationPrivacy: PrivacyLevel;
  experiencePrivacy: PrivacyLevel;
  skillsPrivacy: PrivacyLevel;
  contactUrlPrivacy: PrivacyLevel;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: string | null;
}

export default function PrivacySettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    educationPrivacy: "ONLY_ME",
    experiencePrivacy: "ONLY_ME",
    skillsPrivacy: "ONLY_ME",
    contactUrlPrivacy: "ONLY_ME",
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    twoFactorMethod: null,
  });

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchSettings = async () => {
      try {
        // Fetch privacy settings
        const privacyResponse = await fetch("/api/profile/privacy");
        if (!privacyResponse.ok) throw new Error("Failed to fetch privacy settings");
        
        const privacyData = await privacyResponse.json();
        setSettings(privacyData);
        
        // Fetch security settings
        const securityResponse = await fetch("/api/user/security");
        if (securityResponse.ok) {
          const securityData = await securityResponse.json();
          setSecuritySettings({
            twoFactorEnabled: securityData.twoFactorEnabled,
            twoFactorMethod: securityData.twoFactorMethod,
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [session, router]);

  const handlePrivacyChange = async (field: keyof PrivacySettings, value: PrivacyLevel) => {
    try {
      const response = await fetch("/api/profile/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) throw new Error("Failed to update privacy settings");

      setSettings(prev => ({ ...prev, [field]: value }));
      toast.success("Privacy settings updated");
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings");
    }
  };

  const handleToggle2FA = async () => {
    try {
      setIsUpdating2FA(true);
      
      const endpoint = securitySettings.twoFactorEnabled 
        ? "/api/user/disable-2fa" 
        : "/api/user/enable-2fa";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update 2FA settings");

      const data = await response.json();
      
      setSecuritySettings(prev => ({ 
        ...prev, 
        twoFactorEnabled: !prev.twoFactorEnabled,
        // If enabling 2FA, set method to EMAIL
        twoFactorMethod: !prev.twoFactorEnabled ? "EMAIL" : null
      }));
      
      toast.success(data.message || "Two-factor authentication settings updated");
    } catch (error) {
      console.error("Error updating 2FA settings:", error);
      toast.error("Failed to update two-factor authentication settings");
    } finally {
      setIsUpdating2FA(false);
    }
  };

  const getPrivacyIcon = (level: PrivacyLevel) => {
    switch (level) {
      case "PUBLIC":
        return <Eye className="h-5 w-5" />;
      case "FRIENDS_ONLY":
        return <Users className="h-5 w-5" />;
      case "ONLY_ME":
        return <EyeOff className="h-5 w-5" />;
    }
  };

  const getPrivacyLabel = (level: PrivacyLevel) => {
    switch (level) {
      case "PUBLIC":
        return "Public";
      case "FRIENDS_ONLY":
        return "Friends Only";
      case "ONLY_ME":
        return "Only Me";
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Lock className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Privacy & Security Settings</h1>
          </div>

          {/* Security Settings Card */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Account Security</h2>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {securitySettings.twoFactorEnabled 
                      ? "Two-factor authentication is enabled" 
                      : "Two-factor authentication is disabled"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {securitySettings.twoFactorEnabled 
                      ? "Your account is more secure with 2FA enabled" 
                      : "Enable 2FA to add an extra layer of security to your account"}
                  </p>
                </div>
                <Switch 
                  checked={securitySettings.twoFactorEnabled} 
                  onCheckedChange={handleToggle2FA}
                  disabled={isUpdating2FA}
                />
              </div>

              {securitySettings.twoFactorEnabled && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <div className="flex items-start">
                    <Lock className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Two-factor authentication method: {securitySettings.twoFactorMethod === "EMAIL" ? "Email" : "Unknown"}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        When signing in, you'll need to provide a verification code sent to your email.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!securitySettings.twoFactorEnabled && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-700">
                        Your account is less secure without 2FA
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Two-factor authentication adds an extra layer of security by requiring a verification code in addition to your password when signing in.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Settings Card */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information Privacy</h2>
              
              <div className="space-y-6">
                {/* Education Privacy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Information
                  </label>
                  <div className="flex items-center space-x-4">
                    {["PUBLIC", "FRIENDS_ONLY", "ONLY_ME"].map((level) => (
                      <button
                        key={level}
                        onClick={() => handlePrivacyChange("educationPrivacy", level as PrivacyLevel)}
                        className={`flex items-center px-4 py-2 rounded-md ${
                          settings.educationPrivacy === level
                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {getPrivacyIcon(level as PrivacyLevel)}
                        <span className="ml-2">{getPrivacyLabel(level as PrivacyLevel)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Privacy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Information
                  </label>
                  <div className="flex items-center space-x-4">
                    {["PUBLIC", "FRIENDS_ONLY", "ONLY_ME"].map((level) => (
                      <button
                        key={level}
                        onClick={() => handlePrivacyChange("experiencePrivacy", level as PrivacyLevel)}
                        className={`flex items-center px-4 py-2 rounded-md ${
                          settings.experiencePrivacy === level
                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {getPrivacyIcon(level as PrivacyLevel)}
                        <span className="ml-2">{getPrivacyLabel(level as PrivacyLevel)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Privacy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills Information
                  </label>
                  <div className="flex items-center space-x-4">
                    {["PUBLIC", "FRIENDS_ONLY", "ONLY_ME"].map((level) => (
                      <button
                        key={level}
                        onClick={() => handlePrivacyChange("skillsPrivacy", level as PrivacyLevel)}
                        className={`flex items-center px-4 py-2 rounded-md ${
                          settings.skillsPrivacy === level
                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {getPrivacyIcon(level as PrivacyLevel)}
                        <span className="ml-2">{getPrivacyLabel(level as PrivacyLevel)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact URLs Privacy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact URLs
                  </label>
                  <div className="flex items-center space-x-4">
                    {["PUBLIC", "FRIENDS_ONLY", "ONLY_ME"].map((level) => (
                      <button
                        key={level}
                        onClick={() => handlePrivacyChange("contactUrlPrivacy", level as PrivacyLevel)}
                        className={`flex items-center px-4 py-2 rounded-md ${
                          settings.contactUrlPrivacy === level
                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {getPrivacyIcon(level as PrivacyLevel)}
                        <span className="ml-2">{getPrivacyLabel(level as PrivacyLevel)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Always Public Information</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Username</li>
                  <li>• Email</li>
                  <li>• Number of Participations</li>
                  <li>• Number of Applications</li>
                  <li>• Friends Count</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 