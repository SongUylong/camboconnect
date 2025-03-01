import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update user to disable 2FA
    await db.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: false },
    });

    return NextResponse.json({ success: true, message: "Two-factor authentication disabled successfully" });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 