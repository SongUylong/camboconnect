import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Define the valid privacy levels based on the Prisma schema
type PrivacyLevel = "PUBLIC" | "FRIENDS_ONLY" | "ONLY_ME";

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
    const privacyLevelRaw = data.privacyLevel as string;

    // Validate privacy level
    if (!["PUBLIC", "FRIENDS_ONLY", "ONLY_ME"].includes(privacyLevelRaw)) {
      return NextResponse.json(
        { success: false, message: "Invalid privacy level" },
        { status: 400 }
      );
    }

    const privacyLevel = privacyLevelRaw as PrivacyLevel;

    // Update user privacy settings
    await db.user.update({
      where: { id: session.user.id },
      data: { 
        privacyLevel: privacyLevel as any // Use type assertion to bypass type checking
      },
    });

    return NextResponse.json({ success: true, message: "Privacy settings updated successfully" });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 