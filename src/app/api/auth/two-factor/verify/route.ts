import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { signJwtAccessToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, code } = data;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and code are required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Find the 2FA token
    const twoFactorToken = await db.twoFactorToken.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!twoFactorToken) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if the token has expired
    if (new Date() > twoFactorToken.expires) {
      // Delete the expired token
      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      return NextResponse.json(
        { success: false, message: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Check if the code matches
    if (twoFactorToken.code !== code) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Delete the token after successful verification
    await db.twoFactorToken.delete({
      where: { id: twoFactorToken.id },
    });

    // Create a token that indicates 2FA has been verified
    const twoFactorVerifiedToken = signJwtAccessToken({
      id: user.id,
      email: user.email,
      twoFactorVerified: true,
    }, { expiresIn: "5m" });

    return NextResponse.json({
      success: true,
      twoFactorVerified: true,
      twoFactorVerifiedToken,
    });
  } catch (error) {
    console.error("Error verifying 2FA code:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 