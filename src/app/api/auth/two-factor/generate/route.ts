import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { randomInt } from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email } = data;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return NextResponse.json({ success: true, twoFactorRequired: false });
    }

    // Generate a random 4-digit code
    const code = randomInt(1000, 10000).toString().padStart(4, '0');
    
    // Set expiration time (10 minutes from now)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    // Delete any existing 2FA tokens for this user
    await db.twoFactorToken.deleteMany({
      where: { userId: user.id },
    });

    // Create a new 2FA token
    await db.twoFactorToken.create({
      data: {
        userId: user.id,
        code,
        expires,
      },
    });

    // Send the code via email
    await sendEmail({
      to: user.email,
      subject: "Your CamboConnect Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Verification Code</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your verification code for CamboConnect is:</p>
          <div style="background-color: #f4f4f4; padding: 12px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
          <p>Thank you,<br>The CamboConnect Team</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      twoFactorRequired: true,
      message: "Verification code sent to your email" 
    });
  } catch (error) {
    console.error("Error generating 2FA code:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 