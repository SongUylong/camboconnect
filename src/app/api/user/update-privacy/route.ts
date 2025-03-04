import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Define the valid privacy levels based on the Prisma schema
type PrivacyLevel = "PUBLIC" | "FRIENDS_ONLY" | "ONLY_ME";

interface PrivacySettings {
  privacyLevel?: PrivacyLevel;
  educationPrivacy?: PrivacyLevel;
  experiencePrivacy?: PrivacyLevel;
  skillsPrivacy?: PrivacyLevel;
  contactUrlPrivacy?: PrivacyLevel;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse JSON data
    const data = await request.json();
    
    // Validate privacy settings
    const validPrivacyLevels = ["PUBLIC", "FRIENDS_ONLY", "ONLY_ME"];
    const privacySettings: PrivacySettings = {};
    
    // Validate each privacy setting
    const fieldsToCheck = [
      'privacyLevel',
      'educationPrivacy',
      'experiencePrivacy',
      'skillsPrivacy',
      'contactUrlPrivacy'
    ];

    for (const field of fieldsToCheck) {
      if (data[field] && !validPrivacyLevels.includes(data[field])) {
        return NextResponse.json(
          { success: false, message: `Invalid privacy level for ${field}` },
          { status: 400 }
        );
      }
      if (data[field]) {
        privacySettings[field as keyof PrivacySettings] = data[field] as PrivacyLevel;
      }
    }

    // Update user privacy settings
    await db.user.update({
      where: { id: session.user.id },
      data: privacySettings,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Privacy settings updated successfully",
      settings: privacySettings
    });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 